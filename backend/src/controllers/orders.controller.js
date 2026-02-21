const { OrdersModel } = require("../models/OrdersModel");
const { HoldingsModel } = require("../models/HoldingsModel");

exports.createOrder = async (req, res) => {
  const orderQty = Number(req.body.qty);
  const orderPrice = Number(req.body.price);

  let newOrder = new OrdersModel({
    name: req.body.name,
    qty: orderQty,
    price: orderPrice,
    mode: req.body.mode,
    userId: req.user.id,
  });

  if (req.body.mode === "BUY") {
    await newOrder.save();

    const existingHolding = await HoldingsModel.findOne({
      name: req.body.name,
      userId: req.user.id,
    });

    if (existingHolding) {
      existingHolding.qty += orderQty;
      await existingHolding.save();
    } else {
      const newHolding = new HoldingsModel({
        name: req.body.name,
        qty: orderQty,
        avg: orderPrice,
        price: orderPrice,
        net: "+0.00%",
        day: "+0.00%",
        userId: req.user.id,
      });
      await newHolding.save();
    }
  }

  if (req.body.mode === "SELL") {
    const existingHolding = await HoldingsModel.findOne({
      name: req.body.name,
      userId: req.user.id,
    });

    if (!existingHolding) {
      return res.status(400).json({ message: "No holdings to sell" });
    }

    if (orderQty > existingHolding.qty) {
      return res.status(400).json({ message: "Insufficient quantity" });
    }

    existingHolding.qty -= orderQty;

    if (existingHolding.qty === 0) {
      await existingHolding.deleteOne();
    } else {
      await existingHolding.save();
    }

    await newOrder.save();
  }

  res.json({
    success: true,
    message: "Order saved!",
    data: newOrder,
  });
};

exports.getAllOrders = async (req, res) => {
  let allOrders = await OrdersModel.find({ userId: req.user.id });
  res.json(allOrders);
};
