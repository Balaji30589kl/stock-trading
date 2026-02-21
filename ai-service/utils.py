from datetime import datetime, timedelta
from typing import Tuple

import numpy as np
import pandas as pd
import torch
import yfinance as yf

from model import LSTMRegressor


class ModelCache:
    def __init__(self):
        self.models = {}

    def get(self, symbol: str):
        return self.models.get(symbol)

    def set(self, symbol: str, value):
        self.models[symbol] = value


MODEL_CACHE = ModelCache()


def _fetch_data(symbol: str, period: str = "2y") -> pd.Series:
    df = yf.download(symbol, period=period, interval="1d", progress=False)
    if df.empty or "Close" not in df.columns:
        raise ValueError("No data returned for symbol")
    return df["Close"].dropna()


def _create_sequences(values: np.ndarray, lookback: int) -> Tuple[np.ndarray, np.ndarray]:
    x, y = [], []
    for i in range(lookback, len(values)):
        x.append(values[i - lookback : i])
        y.append(values[i])
    return np.array(x), np.array(y)


def _minmax_scale(values: np.ndarray) -> Tuple[np.ndarray, float, float]:
    vmin = float(values.min())
    vmax = float(values.max())
    if vmax - vmin == 0:
        return np.zeros_like(values), vmin, vmax
    scaled = (values - vmin) / (vmax - vmin)
    return scaled, vmin, vmax


def _minmax_inverse(value: float, vmin: float, vmax: float) -> float:
    if vmax - vmin == 0:
        return vmin
    return value * (vmax - vmin) + vmin


def _train_model(x_train: np.ndarray, y_train: np.ndarray) -> LSTMRegressor:
    device = torch.device("cpu")
    torch.set_num_threads(1)

    model = LSTMRegressor()
    model.to(device)

    x_tensor = torch.tensor(x_train, dtype=torch.float32).unsqueeze(-1).to(device)
    y_tensor = torch.tensor(y_train, dtype=torch.float32).unsqueeze(-1).to(device)

    criterion = torch.nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

    model.train()
    epochs = 15
    batch_size = 64
    for epoch in range(epochs):
        perm = torch.randperm(x_tensor.size(0))
        for i in range(0, x_tensor.size(0), batch_size):
            idx = perm[i : i + batch_size]
            batch_x = x_tensor[idx]
            batch_y = y_tensor[idx]

            optimizer.zero_grad()
            output = model(batch_x)
            loss = criterion(output, batch_y)
            loss.backward()
            optimizer.step()

    return model


def predict_next_close(symbol: str, lookback: int = 60) -> float:
    symbol = symbol.upper().strip()
    cache_entry = MODEL_CACHE.get(symbol)

    if cache_entry:
        model, vmin, vmax, last_trained = cache_entry
        if datetime.utcnow() - last_trained < timedelta(hours=24):
            return _predict_with_model(symbol, model, vmin, vmax, lookback)

    close_series = _fetch_data(symbol)
    values = close_series.values.astype(np.float32)

    if len(values) <= lookback:
        raise ValueError("Insufficient data for prediction")

    scaled, vmin, vmax = _minmax_scale(values)
    x, y = _create_sequences(scaled, lookback)

    model = _train_model(x, y)
    MODEL_CACHE.set(symbol, (model, vmin, vmax, datetime.utcnow()))

    return _predict_with_model(symbol, model, vmin, vmax, lookback)


def _predict_with_model(symbol: str, model: LSTMRegressor, vmin: float, vmax: float, lookback: int) -> float:
    close_series = _fetch_data(symbol)
    values = close_series.values.astype(np.float32)

    if len(values) <= lookback:
        raise ValueError("Insufficient data for prediction")

    scaled, _, _ = _minmax_scale(values)
    last_seq = scaled[-lookback:]

    x_tensor = torch.tensor(last_seq, dtype=torch.float32).unsqueeze(0).unsqueeze(-1)
    model.eval()
    with torch.no_grad():
        pred_scaled = model(x_tensor).item()

    pred = _minmax_inverse(pred_scaled, vmin, vmax)
    return float(round(pred, 2))
