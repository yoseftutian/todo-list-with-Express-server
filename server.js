const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.path}`);
  next();
});

// Middlewares
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Could not connect to MongoDB Atlas...", err));

// Routes
const taskRoutes = require("./router/tasks");
app.use("/tasks", taskRoutes);

// Start the server
const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
