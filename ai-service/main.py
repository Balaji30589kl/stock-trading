from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from utils import predict_next_close

app = FastAPI(title="AI Stock Prediction Service", version="1.0.0")


class PredictRequest(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=10)


class PredictResponse(BaseModel):
    symbol: str
    predicted_close: float


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    try:
        predicted = predict_next_close(payload.symbol)
        return {"symbol": payload.symbol.upper(), "predicted_close": predicted}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Prediction failed")
