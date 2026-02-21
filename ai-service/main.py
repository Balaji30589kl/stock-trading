from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from inference import predict_next_close

app = FastAPI(title="AI Stock Prediction Service", version="1.0.0")


class PredictRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=15)


class PredictMetrics(BaseModel):
    rmse: float | None


class PredictMetadata(BaseModel):
    trained_at: str | None
    lookback: int | None
    train_size: int | None
    test_size: int | None
    data_points: int | None
    data_end_date: str | None
    model_version: str | None


class HistoryPoint(BaseModel):
    date: str
    close: float


class PredictResponse(BaseModel):
    symbol: str
    stock_name: str | None
    predicted_close: float
    last_close: float | None
    history: list[HistoryPoint]
    metrics: PredictMetrics
    metadata: PredictMetadata


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    try:
        result = predict_next_close(payload.symbol)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Prediction failed")
