from typing import Dict, Tuple

import numpy as np
import pandas as pd
import yfinance as yf


DEFAULT_PERIOD = "2y"


def fetch_close_series(symbol: str, period: str = DEFAULT_PERIOD) -> pd.Series:
    df = yf.download(symbol, period=period, interval="1d", progress=False)
    if df.empty:
        raise ValueError("No data returned for symbol")
    
    # Handle MultiIndex columns from yfinance
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    
    if "Close" not in df.columns:
        raise ValueError("No data returned for symbol")
    return df["Close"].dropna()


def create_sequences(values: np.ndarray, lookback: int) -> Tuple[np.ndarray, np.ndarray]:
    x, y = [], []
    for i in range(lookback, len(values)):
        x.append(values[i - lookback : i])
        y.append(values[i])
    return np.array(x), np.array(y)


def minmax_scale(values: np.ndarray) -> Tuple[np.ndarray, float, float]:
    vmin = float(values.min())
    vmax = float(values.max())
    if vmax - vmin == 0:
        return np.zeros_like(values), vmin, vmax
    scaled = (values - vmin) / (vmax - vmin)
    return scaled, vmin, vmax


def minmax_scale_with(values: np.ndarray, vmin: float, vmax: float) -> np.ndarray:
    if vmax - vmin == 0:
        return np.zeros_like(values)
    return (values - vmin) / (vmax - vmin)


def minmax_inverse(value: float, vmin: float, vmax: float) -> float:
    if vmax - vmin == 0:
        return vmin
    return value * (vmax - vmin) + vmin


def split_train_test(x: np.ndarray, y: np.ndarray, train_ratio: float = 0.8) -> Dict[str, np.ndarray]:
    if len(x) == 0:
        return {"x_train": x, "y_train": y, "x_test": x, "y_test": y}
    split_index = int(len(x) * train_ratio)
    x_train = x[:split_index]
    y_train = y[:split_index]
    x_test = x[split_index:]
    y_test = y[split_index:]
    return {"x_train": x_train, "y_train": y_train, "x_test": x_test, "y_test": y_test}


def prepare_data(symbol: str, lookback: int, period: str = DEFAULT_PERIOD) -> Dict[str, object]:
    close_series = fetch_close_series(symbol, period=period)
    values = close_series.values.astype(np.float32).flatten()
    if len(values) <= lookback:
        raise ValueError("Insufficient data for prediction")

    scaled, vmin, vmax = minmax_scale(values)
    x, y = create_sequences(scaled, lookback)

    return {
        "values": values,
        "scaled": scaled,
        "vmin": vmin,
        "vmax": vmax,
        "x": x,
        "y": y,
        "data_points": len(values),
        "data_end_date": close_series.index[-1].date().isoformat(),
        "last_close": float(values[-1].item()),
    }


def fetch_stock_name(symbol: str) -> str | None:
    try:
        info = yf.Ticker(symbol).info
    except Exception:
        return None
    return info.get("shortName") or info.get("longName")


def fetch_history(symbol: str, period: str = "6mo") -> list[Dict[str, object]]:
    df = yf.download(symbol, period=period, interval="1d", progress=False)
    if df.empty:
        return []
    
    # Handle MultiIndex columns from yfinance
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    
    if "Close" not in df.columns:
        return []

    closes = df["Close"].dropna()
    history = []
    for idx, value in closes.items():
        history.append(
            {
                "date": idx.date().isoformat(),
                "close": float(round(value, 2)),
            }
        )
    return history
