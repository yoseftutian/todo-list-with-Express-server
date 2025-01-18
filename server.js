const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");


require("dotenv").config();

const app = express();
app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.path}`);
  next();
});

// Middlewares
app.use(bodyParser.json());
app.use(morgan("combined")); 


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);


// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Could not connect to MongoDB Atlas...", err));

// Routes
const taskRoutes = require("./router/tasks");
app.use("/tasks", taskRoutes);

const authRoutes = require("./router/auth");
app.use("/auth", authRoutes);


// Start the server
const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
