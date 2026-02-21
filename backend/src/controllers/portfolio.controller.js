const { HoldingsModel } = require("../models/HoldingsModel");
const { PositionsModel } = require("../models/PositionsModel");

exports.getAllHoldings = async (req, res) => {
  let allHoldings = await HoldingsModel.find({ userId: req.user.id });
  res.json(allHoldings);
};

exports.getAllPositions = async (req, res) => {
  let allPositions = await PositionsModel.find({ userId: req.user.id });
  res.json(allPositions);
};
