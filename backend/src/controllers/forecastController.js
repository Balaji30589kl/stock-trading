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

    const forecast = await aiService.getForecast(symbol);
    return res.json({
      success: true,
      data: forecast,
    });
  } catch (error) {
    const status = error.message === "AI service request timed out" ? 504 : 502;
    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getForecast,
};
