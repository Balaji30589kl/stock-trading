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
    
    // Chart dimensions with proper padding for axes
    const width = 600;
    const height = 300;
    const paddingLeft = 60;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Generate line points
    const points = values
      .map((value, index) => {
        const x = paddingLeft + (index / (values.length - 1)) * chartWidth;
        const y = paddingTop + chartHeight - ((value - min) / range) * chartHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    // Generate gradient area points
    const areaPoints = `${paddingLeft},${paddingTop + chartHeight} ${points} ${paddingLeft + chartWidth},${paddingTop + chartHeight}`;

    // Y-axis labels (5 levels)
    const yAxisLabels = [];
    for (let i = 0; i <= 4; i++) {
      const value = min + (range * i) / 4;
      const y = paddingTop + chartHeight - (i / 4) * chartHeight;
      yAxisLabels.push({ value: value.toFixed(2), y });
    }

    // X-axis labels (show every nth date to avoid crowding)
    const xAxisLabels = [];
    const labelCount = Math.min(6, history.length);
    for (let i = 0; i < labelCount; i++) {
      const index = Math.floor((i / (labelCount - 1)) * (history.length - 1));
      const x = paddingLeft + (index / (values.length - 1)) * chartWidth;
      const date = history[index]?.date || "";
      const shortDate = date ? date.substring(5) : ""; // MM-DD format
      xAxisLabels.push({ label: shortDate, x });
    }

    return {
      points,
      areaPoints,
      min: min.toFixed(2),
      max: max.toFixed(2),
      yAxisLabels,
      xAxisLabels,
      width,
      height,
      paddingLeft,
      paddingTop,
      paddingBottom,
      chartWidth,
      chartHeight,
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
        <p style={{ margin: "0 0 16px 0", fontWeight: "bold", color: "#374151", fontSize: "15px" }}>
          📊 Price History (6 months)
        </p>
        {chart ? (
          <div style={{ marginBottom: "20px" }}>
            <svg 
              className="professional-chart" 
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              style={{ width: "100%", height: "auto", maxHeight: "300px" }}
            >
              {/* Grid lines */}
              <defs>
                <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              
              {/* Horizontal grid lines */}
              {chart.yAxisLabels.map((label, i) => (
                <line
                  key={`hgrid-${i}`}
                  x1={chart.paddingLeft}
                  y1={label.y}
                  x2={chart.paddingLeft + chart.chartWidth}
                  y2={label.y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              ))}
              
              {/* Y-axis */}
              <line
                x1={chart.paddingLeft}
                y1={chart.paddingTop}
                x2={chart.paddingLeft}
                y2={chart.paddingTop + chart.chartHeight}
                stroke="#9ca3af"
                strokeWidth="1.5"
              />
              
              {/* X-axis */}
              <line
                x1={chart.paddingLeft}
                y1={chart.paddingTop + chart.chartHeight}
                x2={chart.paddingLeft + chart.chartWidth}
                y2={chart.paddingTop + chart.chartHeight}
                stroke="#9ca3af"
                strokeWidth="1.5"
              />
              
              {/* Area under the line */}
              <polygon
                fill="url(#areaGradient)"
                points={chart.areaPoints}
              />
              
              {/* Price line */}
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={chart.points}
              />
              
              {/* Y-axis labels */}
              {chart.yAxisLabels.map((label, i) => (
                <text
                  key={`ylabel-${i}`}
                  x={chart.paddingLeft - 8}
                  y={label.y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#6b7280"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                >
                  ₹{label.value}
                </text>
              ))}
              
              {/* X-axis labels */}
              {chart.xAxisLabels.map((label, i) => (
                <text
                  key={`xlabel-${i}`}
                  x={label.x}
                  y={chart.paddingTop + chart.chartHeight + 20}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                >
                  {label.label}
                </text>
              ))}
              
              {/* Chart title */}
              <text
                x={chart.paddingLeft + chart.chartWidth / 2}
                y={chart.paddingTop + chart.chartHeight + 35}
                textAnchor="middle"
                fontSize="10"
                fill="#9ca3af"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
              >
                Date (MM-DD)
              </text>
              
              <text
                x={15}
                y={chart.paddingTop + chart.chartHeight / 2}
                textAnchor="middle"
                fontSize="10"
                fill="#9ca3af"
                fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                transform={`rotate(-90, 15, ${chart.paddingTop + chart.chartHeight / 2})`}
              >
                Price (₹)
              </text>
            </svg>
            <div style={{ 
              marginTop: "12px", 
              padding: "8px 12px", 
              backgroundColor: "#f0f9ff", 
              borderRadius: "4px",
              fontSize: "12px",
              color: "#0369a1",
              display: "flex",
              justifyContent: "space-between"
            }}>
              <span><strong>Range:</strong> ₹{chart.min} - ₹{chart.max}</span>
              <span><strong>Current Trend:</strong> {parseFloat(chart.max) > parseFloat(chart.min) * 1.05 ? "📈 Upward" : parseFloat(chart.max) < parseFloat(chart.min) * 0.95 ? "📉 Downward" : "➡️ Stable"}</span>
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
