# Zerodha (AI Trading Dashboard) - v1

Full-stack demo of a stock dashboard with AI-powered next-day price predictions.

## Architecture

- dashboard/: React UI
- backend/: Node.js + Express API + JWT auth
- ai-service/: FastAPI + PyTorch LSTM prediction service
- MongoDB for users/portfolio data

## Prerequisites

- Node.js (18+ recommended)
- Python 3.10 (Anaconda works well on Windows)
- MongoDB running locally

## Setup

### 1) Backend

```bash
cd backend
npm install
```

Create backend/.env using backend/.env.example.

### 2) AI Service

```bash
cd ai-service
python -m pip install -r requirements.txt
```

### 3) Frontend

```bash
cd dashboard
npm install
```

## Run (3 terminals)

### Terminal A - AI Service

```bash
cd ai-service
python -m uvicorn main:app --reload --port 8000
```

### Terminal B - Backend

```bash
cd backend
npm run dev
```

### Terminal C - Frontend

```bash
cd dashboard
npm start
```

## URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:3002
- AI Service: http://localhost:8000

## API Endpoints

- POST /register
- POST /login
- POST /forecast (JWT required)

## Notes

- AI model artifacts are generated on first prediction and stored in ai-service/artifacts (ignored by git).
- Predictions are for educational use only.
