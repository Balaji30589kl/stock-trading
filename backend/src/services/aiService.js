const axios = require("axios");

const AI_BASE_URL = process.env.AI_SERVICE_URL;
const AI_TIMEOUT = parseInt(process.env.AI_SERVICE_TIMEOUT || "30000", 10);

const getForecast = async (symbol) => {
  if (!AI_BASE_URL) {
    throw new Error("AI_SERVICE_URL is not configured");
  }

  try {
    const response = await axios.post(
      `${AI_BASE_URL}/predict`,
      { symbol },
      { timeout: AI_TIMEOUT }
    );

    // Validate AI service response structure
    if (!response.data || !response.data.symbol) {
      throw new Error("Invalid response from AI service");
    }

    return {
      symbol: response.data.symbol,
      prediction: {
        next_close: response.data.predicted_close,
        generated_at: new Date().toISOString(),
      },
      metrics: response.data.metrics || { rmse: null },
      model_info: {
        trained_at: response.data.metadata?.trained_at,
        lookback: response.data.metadata?.lookback,
        train_size: response.data.metadata?.train_size,
        test_size: response.data.metadata?.test_size,
        data_points: response.data.metadata?.data_points,
        model_version: response.data.metadata?.model_version,
      },
    };
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      throw new Error("AI service request timed out");
    }

    if (error.response) {
      const message = error.response.data?.detail || "AI service error";
      throw new Error(message);
    }

    throw new Error("Unable to reach AI service");
  }
};

module.exports = {
  getForecast,
};
