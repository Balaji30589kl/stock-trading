import React, { useMemo } from "react";

const PredictionResult = ({ prediction }) => {
  const signal = useMemo(() => {
    if (!prediction || !prediction.prediction) return null;

    const predictedPrice = prediction.prediction.next_close;
    const lastClose =
      typeof prediction.last_close === "number"
        ? prediction.last_close
        : predictedPrice * 0.98;

    const changePercent = (
      ((predictedPrice - lastClose) / lastClose) *
      100
    ).toFixed(2);

    return {
      changePercent: parseFloat(changePercent),
      signal: parseFloat(changePercent) >= 1 ? "BUY" : "SELL",
      color: parseFloat(changePercent) >= 1 ? "#16a34a" : "#dc2626",
      lastClose: lastClose.toFixed(2),
    };
  }, [prediction]);

  const chart = useMemo(() => {
    const history = Array.isArray(prediction?.history) ? prediction.history : [];
    if (history.length < 2) return null;

    const values = history
      .map((item) => item.close)
      .filter((value) => typeof value === "number");

    if (values.length < 2) return null;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const width = 300;
    const height = 120;
    const padding = 6;

    const points = values
      .map((value, index) => {
        const x =
          (index / (values.length - 1)) * (width - padding * 2) + padding;
        const y =
          height -
          padding -
          ((value - min) / range) * (height - padding * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    return {
      points,
      min: min.toFixed(2),
      max: max.toFixed(2),
      startLabel: history[0]?.date,
      endLabel: history[history.length - 1]?.date,
    };
  }, [prediction]);

  if (!prediction) return null;

  return (
    <div className="section" style={{ marginTop: "20px" }}>
      {/* Main Prediction Card */}
      <div
        style={{
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <p style={{ fontSize: "12px", color: "#666", margin: "0 0 4px 0" }}>
              Symbol
            </p>
            <h2 style={{ margin: "0", fontSize: "24px", fontWeight: "bold" }}>
              {prediction.symbol}
            </h2>
            {prediction.stock_name && (
              <p style={{ margin: "6px 0 0 0", fontSize: "12px", color: "#6b7280" }}>
                {prediction.stock_name}
              </p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "12px", color: "#666", margin: "0 0 4px 0" }}>
              Signal
            </p>
            <div
              style={{
                padding: "8px 16px",
                backgroundColor: signal.color,
                color: "white",
                borderRadius: "4px",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              {signal.signal}
            </div>
          </div>
        </div>

        <hr style={{ margin: "16px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

        {/* Prediction Data */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div>
            <p style={{ fontSize: "12px", color: "#666", margin: "0 0 4px 0" }}>
              Last Close
            </p>
            <h3 style={{ margin: "0", fontSize: "18px", color: "#1f2937" }}>
              ₹{signal.lastClose}
            </h3>
          </div>
          <div>
            <p style={{ fontSize: "12px", color: "#666", margin: "0 0 4px 0" }}>
              Predicted Next Close
            </p>
            <h3 style={{ margin: "0", fontSize: "18px", color: "#1f2937" }}>
              ₹{prediction.prediction.next_close.toFixed(2)}
            </h3>
          </div>
          <div>
            <p style={{ fontSize: "12px", color: "#666", margin: "0 0 4px 0" }}>
              Expected Change
            </p>
            <h3
              style={{
                margin: "0",
                fontSize: "18px",
                color: signal.color,
                fontWeight: "bold",
              }}
            >
              {signal.changePercent >= 0 ? "+" : ""}{signal.changePercent}%
            </h3>
          </div>
          <div>
            <p style={{ fontSize: "12px", color: "#666", margin: "0 0 4px 0" }}>
              Model Confidence (RMSE)
            </p>
            <h3 style={{ margin: "0", fontSize: "18px", color: "#1f2937" }}>
              {typeof prediction.metrics?.rmse === "number"
                ? prediction.metrics.rmse.toFixed(2)
                : "N/A"}
            </h3>
          </div>
        </div>
      </div>

      {/* Price History */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "16px",
        }}
      >
        <p style={{ margin: "0 0 12px 0", fontWeight: "bold", color: "#374151" }}>
          Price History (6 months)
        </p>
        {chart ? (
          <div style={{ marginBottom: "16px" }}>
            <svg className="history-chart" viewBox="0 0 300 120" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                points={chart.points}
              />
            </svg>
            <div className="chart-labels">
              <span>{chart.startLabel}</span>
              <span>{chart.endLabel}</span>
            </div>
            <div className="chart-range">
              Low: ₹{chart.min} | High: ₹{chart.max}
            </div>
          </div>
        ) : (
          <p style={{ color: "#6b7280", fontSize: "12px" }}>
            No price history available for chart.
          </p>
        )}

        {Array.isArray(prediction.history) && prediction.history.length > 0 ? (
          <table className="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Close (₹)</th>
              </tr>
            </thead>
            <tbody>
              {prediction.history
                .slice(-15)
                .reverse()
                .map((row) => (
                  <tr key={row.date}>
                    <td className="align-left">{row.date}</td>
                    <td>{row.close.toFixed(2)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: "#6b7280", fontSize: "12px" }}>
            No price history available.
          </p>
        )}
      </div>

      {/* Model Info */}
      <div
        style={{
          backgroundColor: "#f3f4f6",
          borderRadius: "8px",
          padding: "12px",
          fontSize: "12px",
          color: "#666",
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontWeight: "bold" }}>
          📈 Model Information
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            fontSize: "11px",
          }}
        >
          <div>
            <span style={{ fontWeight: "bold" }}>Version:</span>{" "}
            {prediction.model_info.model_version}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>Lookback:</span>{" "}
            {prediction.model_info.lookback} days
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>Training Data:</span>{" "}
            {prediction.model_info.train_size} samples
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>Test Data:</span>{" "}
            {prediction.model_info.test_size} samples
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>Total Points:</span>{" "}
            {prediction.model_info.data_points}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>Trained:</span>{" "}
            {new Date(prediction.model_info.trained_at).toLocaleDateString()} at{" "}
            {new Date(prediction.model_info.trained_at).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          backgroundColor: "#fef3c7",
          border: "1px solid #fcd34d",
          borderRadius: "4px",
          padding: "12px",
          marginTop: "16px",
          fontSize: "11px",
          color: "#92400e",
        }}
      >
        ⚠️ <strong>Disclaimer:</strong> This prediction is for educational
        purposes only. Do not make investment decisions based solely on AI
        predictions. Always conduct thorough research and consult a financial
        advisor.
      </div>
    </div>
  );
};

export default PredictionResult;
