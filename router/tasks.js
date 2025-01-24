const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error("Token verification error:", err);
        return res.status(403).json({ message: "Forbidden - Invalid token" });
      }

      if (!user || !user.id) {
        return res
          .status(403)
          .json({ message: "Forbidden - Invalid token structure" });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
}

// Helper function to calculate next due date
function getNextDueDate(frequency) {
  const now = new Date();
  switch (frequency) {
    case "daily":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly":
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    default:
      return now;
  }
}

// Create a new task
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, recurring, frequency } = req.body;

    const task = new Task({
      title,
      userId: req.user.id,
      recurring,
      frequency,
      nextDueDate: recurring ? getNextDueDate(frequency) : null,
    });
    const savedTask = await task.save();
    await User.findByIdAndUpdate(req.user.id, {
      $push: { tasks: savedTask._id },
    });
    res.status(201).json(savedTask);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(400).json({ message: err.message });
  }
});

// Get all tasks

router.get("/", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id });
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update task

router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { completed: req.body.completed },
      { new: true, user: req.user }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.recurring) {
      task.nextDueDate = getNextDueDate(task.frequency);
      await task.save();
    }

    res.json(task);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(400).json({ message: err.message });
  }
});

// Delete task
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id }).setOptions(
      { user: req.user }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { tasks: req.params.id },
    });

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
