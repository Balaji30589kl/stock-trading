const axios = require("axios");

const AI_BASE_URL = process.env.AI_SERVICE_URL;

const getForecast = async (symbol) => {
  if (!AI_BASE_URL) {
    throw new Error("AI_SERVICE_URL is not configured");
  }

  try {
    const response = await axios.post(
      `${AI_BASE_URL}/predict`,
      { symbol },
      { timeout: 10000 }
    );

    return {
      symbol: response.data.symbol,
      prediction: {
        next_close: response.data.predicted_close,
        generated_at: new Date().toISOString(),
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
