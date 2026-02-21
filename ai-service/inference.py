import os
from typing import Dict, Optional

import numpy as np
import torch

from data import (
    fetch_history,
    fetch_stock_name,
    minmax_inverse,
    minmax_scale_with,
    prepare_data,
    split_train_test,
)
from trainer import (
    DEFAULT_SEED,
    build_metadata,
    evaluate_rmse,
    load_artifacts,
    save_artifacts,
    train_model,
)


ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
MODEL_CACHE: Dict[str, Dict[str, object]] = {}


def _load_or_train(symbol: str, lookback: int, seed: int = DEFAULT_SEED) -> Dict[str, object]:
    cache_entry = MODEL_CACHE.get(symbol)
    if cache_entry and cache_entry.get("metadata", {}).get("lookback") == lookback:
        return cache_entry

    artifacts = load_artifacts(symbol, ARTIFACTS_DIR)
    if artifacts and artifacts.get("metadata", {}).get("lookback") == lookback:
        MODEL_CACHE[symbol] = artifacts
        return artifacts

    prepared = prepare_data(symbol, lookback)
    split = split_train_test(prepared["x"], prepared["y"], train_ratio=0.8)

    model = train_model(split["x_train"], split["y_train"], seed=seed)
    rmse = evaluate_rmse(model, split["x_test"], split["y_test"], prepared["vmin"], prepared["vmax"])

    metadata = build_metadata(
        symbol=symbol,
        lookback=lookback,
        train_size=len(split["x_train"]),
        test_size=len(split["x_test"]),
        data_points=prepared["data_points"],
        data_end_date=prepared["data_end_date"],
        rmse=rmse,
        seed=seed,
    )

    save_artifacts(symbol, model, prepared["vmin"], prepared["vmax"], metadata, ARTIFACTS_DIR)

    artifacts = {
        "model": model,
        "vmin": prepared["vmin"],
        "vmax": prepared["vmax"],
        "metadata": metadata,
    }
    MODEL_CACHE[symbol] = artifacts
    return artifacts


def predict_next_close(symbol: str, lookback: int = 60) -> Dict[str, object]:
    symbol = symbol.upper().strip()
    artifacts = _load_or_train(symbol, lookback)

    prepared = prepare_data(symbol, lookback)
    scaled_latest = minmax_scale_with(prepared["values"], artifacts["vmin"], artifacts["vmax"])
    last_seq = scaled_latest[-lookback:]

    x_tensor = torch.tensor(last_seq, dtype=torch.float32).unsqueeze(0).unsqueeze(-1)
    model = artifacts["model"]
    model.eval()
    with torch.no_grad():
        pred_scaled = model(x_tensor).item()

    predicted = minmax_inverse(pred_scaled, artifacts["vmin"], artifacts["vmax"])

    stock_name = fetch_stock_name(symbol)
    history = fetch_history(symbol, period="6mo")

    response = {
        "symbol": symbol,
        "stock_name": stock_name,
        "predicted_close": float(round(predicted, 2)),
        "last_close": prepared.get("last_close"),
        "history": history,
        "metrics": {"rmse": artifacts["metadata"].get("rmse")},
        "metadata": {
            "trained_at": artifacts["metadata"].get("trained_at"),
            "lookback": artifacts["metadata"].get("lookback"),
            "train_size": artifacts["metadata"].get("train_size"),
            "test_size": artifacts["metadata"].get("test_size"),
            "data_points": artifacts["metadata"].get("data_points"),
            "data_end_date": artifacts["metadata"].get("data_end_date"),
            "model_version": artifacts["metadata"].get("model_version"),
        },
    }
    return response
