const mongoose = require("mongoose");

const uri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/zerodha";

const connectDB = () => {
  mongoose.connect(uri);
};

module.exports = connectDB;
