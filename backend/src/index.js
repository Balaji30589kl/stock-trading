require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connectDB = require("./config/database");
const portfolioRoutes = require("./routes/portfolio.routes");
const ordersRoutes = require("./routes/orders.routes");
const authRoutes = require("./routes/auth.routes");
const forecastRoutes = require("./routes/forecastRoutes");

const PORT = process.env.PORT || 3002;

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/", authRoutes);
app.use("/", portfolioRoutes);
app.use("/", ordersRoutes);
app.use("/", forecastRoutes);

app.listen(PORT, () => {
  console.log("App started!");
  connectDB();
  console.log("DB started!");
});
