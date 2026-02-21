import json
import os
import random
from datetime import datetime
from typing import Dict, Optional

import numpy as np
import torch

from data import minmax_inverse
from model import LSTMRegressor


DEFAULT_SEED = 42


def set_deterministic_seed(seed: int = DEFAULT_SEED) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


def train_model(
    x_train: np.ndarray,
    y_train: np.ndarray,
    seed: int = DEFAULT_SEED,
    epochs: int = 15,
    batch_size: int = 64,
    lr: float = 0.001,
) -> LSTMRegressor:
    device = torch.device("cpu")
    torch.set_num_threads(1)
    set_deterministic_seed(seed)

    model = LSTMRegressor()
    model.to(device)

    x_tensor = torch.tensor(x_train, dtype=torch.float32).unsqueeze(-1).to(device)
    y_tensor = torch.tensor(y_train, dtype=torch.float32).unsqueeze(-1).to(device)

    criterion = torch.nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    model.train()
    for _ in range(epochs):
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


def evaluate_rmse(
    model: LSTMRegressor,
    x_test: np.ndarray,
    y_test: np.ndarray,
    vmin: float,
    vmax: float,
) -> Optional[float]:
    if len(x_test) == 0:
        return None

    device = torch.device("cpu")
    x_tensor = torch.tensor(x_test, dtype=torch.float32).unsqueeze(-1).to(device)

    model.eval()
    with torch.no_grad():
        preds_scaled = model(x_tensor).squeeze(-1).cpu().numpy()

    preds = np.array([minmax_inverse(val, vmin, vmax) for val in preds_scaled], dtype=np.float32)
    actual = np.array([minmax_inverse(val, vmin, vmax) for val in y_test], dtype=np.float32)

    mse = np.mean((preds - actual) ** 2)
    rmse = float(np.sqrt(mse))
    return round(rmse, 4)


def _symbol_dir(artifacts_dir: str, symbol: str) -> str:
    safe = "".join(ch if ch.isalnum() else "_" for ch in symbol.upper())
    return os.path.join(artifacts_dir, safe)


def save_artifacts(
    symbol: str,
    model: LSTMRegressor,
    vmin: float,
    vmax: float,
    metadata: Dict[str, object],
    artifacts_dir: str,
) -> Dict[str, str]:
    symbol_path = _symbol_dir(artifacts_dir, symbol)
    os.makedirs(symbol_path, exist_ok=True)

    model_path = os.path.join(symbol_path, "model.pt")
    scaler_path = os.path.join(symbol_path, "scaler.json")
    meta_path = os.path.join(symbol_path, "metadata.json")

    torch.save(model.state_dict(), model_path)
    with open(scaler_path, "w", encoding="utf-8") as scaler_file:
        json.dump({"vmin": vmin, "vmax": vmax}, scaler_file, indent=2)
    with open(meta_path, "w", encoding="utf-8") as meta_file:
        json.dump(metadata, meta_file, indent=2)

    return {"model": model_path, "scaler": scaler_path, "metadata": meta_path}


def load_artifacts(symbol: str, artifacts_dir: str) -> Optional[Dict[str, object]]:
    symbol_path = _symbol_dir(artifacts_dir, symbol)
    model_path = os.path.join(symbol_path, "model.pt")
    scaler_path = os.path.join(symbol_path, "scaler.json")
    meta_path = os.path.join(symbol_path, "metadata.json")

    if not (os.path.exists(model_path) and os.path.exists(scaler_path) and os.path.exists(meta_path)):
        return None

    with open(scaler_path, "r", encoding="utf-8") as scaler_file:
        scaler = json.load(scaler_file)

    with open(meta_path, "r", encoding="utf-8") as meta_file:
        metadata = json.load(meta_file)

    model = LSTMRegressor()
    model.load_state_dict(torch.load(model_path, map_location="cpu"))
    model.eval()

    return {
        "model": model,
        "vmin": float(scaler["vmin"]),
        "vmax": float(scaler["vmax"]),
        "metadata": metadata,
        "paths": {"model": model_path, "scaler": scaler_path, "metadata": meta_path},
    }


def build_metadata(
    symbol: str,
    lookback: int,
    train_size: int,
    test_size: int,
    data_points: int,
    data_end_date: str,
    rmse: Optional[float],
    seed: int,
) -> Dict[str, object]:
    return {
        "symbol": symbol.upper(),
        "lookback": lookback,
        "train_size": train_size,
        "test_size": test_size,
        "data_points": data_points,
        "data_end_date": data_end_date,
        "rmse": rmse,
        "seed": seed,
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "model_version": "lstm_v1",
    }
