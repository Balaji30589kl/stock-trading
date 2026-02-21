import React, { useState } from "react";

const PredictionForm = ({ onSearch, loading }) => {
  const [symbol, setSymbol] = useState("");

  const handleChange = (e) => {
    setSymbol(e.target.value.toUpperCase().slice(0, 15));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (symbol.trim()) {
      onSearch(symbol);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Enter stock symbol (e.g., MSFT, TSLA, GOOGL)"
          value={symbol}
          onChange={handleChange}
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
            fontFamily: "inherit",
          }}
          maxLength="15"
        />
        <button
          type="submit"
          disabled={loading || !symbol.trim()}
          style={{
            padding: "10px 24px",
            backgroundColor: loading || !symbol.trim() ? "#ccc" : "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading || !symbol.trim() ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          {loading ? "Searching..." : "Predict"}
        </button>
      </div>
      <p style={{ fontSize: "12px", color: "#666", margin: "0" }}>
        📊 AI uses 60-day sliding window LSTM to predict next-day closing price
      </p>
    </form>
  );
};

export default PredictionForm;
