import React, { useState } from "react";
import axios from "../api/axios";
import PredictionForm from "./PredictionForm";
import PredictionResult from "./PredictionResult";

const AiPage = () => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSymbol, setLastSymbol] = useState(null);

  const handleSearch = async (symbol) => {
    if (!symbol || symbol.trim().length === 0) {
      setError("Please enter a valid symbol");
      return;
    }

    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const response = await axios.post("/forecast", {
        symbol: symbol.toUpperCase(),
      });

      if (response.data.success) {
        setPrediction(response.data.data);
        setLastSymbol(symbol.toUpperCase());
      } else {
        setError(response.data.message || "Failed to fetch prediction");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch prediction. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="username">
        <h6>AI Stock Prediction</h6>
        <hr className="divider" />
      </div>

      <div className="section">
        <PredictionForm onSearch={handleSearch} loading={loading} />

        {loading && (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p className="loading-text">Analyzing stock data...</p>
          </div>
        )}

        {error && (
          <div
            className="error-state"
            style={{
              backgroundColor: "#ffe6e6",
              color: "#d32f2f",
              padding: "12px",
              borderRadius: "4px",
              marginTop: "16px",
            }}
          >
            ❌ {error}
          </div>
        )}

        {prediction && !loading && (
          <PredictionResult prediction={prediction} />
        )}

        {!prediction && !loading && !error && (
          <div
            style={{
              textAlign: "center",
              marginTop: "40px",
              color: "#888",
            }}
          >
            <p>Enter a stock symbol to get AI-powered predictions</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AiPage;
