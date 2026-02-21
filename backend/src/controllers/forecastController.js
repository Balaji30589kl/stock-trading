const aiService = require("../services/aiService");

const getForecast = async (req, res) => {
  try {
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: "Symbol is required",
      });
    }

    if (typeof symbol !== "string" || symbol.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Symbol must be a non-empty string",
      });
    }

    const forecast = await aiService.getForecast(symbol.trim().toUpperCase());

    return res.json({
      success: true,
      data: {
        symbol: forecast.symbol,
        stock_name: forecast.stock_name,
        prediction: {
          next_close: forecast.prediction.next_close,
          confidence_metric: `RMSE: ${(forecast.metrics.rmse || 0).toFixed(2)}`,
        },
        last_close: forecast.last_close,
        history: forecast.history,
        metrics: forecast.metrics,
        model_info: forecast.model_info,
        generated_at: forecast.prediction.generated_at,
      },
    });
  } catch (error) {
    // Determine HTTP status based on error
    let status = 502; // Bad Gateway (AI service error)
    if (error.message === "AI service request timed out") {
      status = 504; // Gateway Timeout
    } else if (error.message.includes("Symbol") || error.message.includes("required")) {
      status = 400; // Bad Request
    } else if (error.message.includes("not configured")) {
      status = 500; // Internal Server Error (config issue)
    }

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getForecast,
};
