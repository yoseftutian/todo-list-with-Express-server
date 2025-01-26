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

router.post("/:id/share", authenticateToken, async (req, res) => {
  try {
    const { userIdToShare } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.sharedWith.includes(userIdToShare)) {
      return res
        .status(400)
        .json({ message: "Task already shared with this user" });
    }

    task.sharedWith.push(userIdToShare);
    await task.save();

    const sharedUser = await User.findById(userIdToShare);
    if (!sharedUser) {
      return res.status(404).json({ message: "User to share with not found" });
    }

    if (!sharedUser.tasks.includes(task._id)) {
      sharedUser.tasks.push(task._id);
      await sharedUser.save();
    }

    res.json({ message: "Task shared successfully", task });
  } catch (err) {
    console.error("Error sharing task:", err);
    res.status(400).json({ message: err.message });
  }
});

// Get all tasks for a user (owned or shared)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { userId: req.user.id }, 
        { sharedWith: req.user.id }, 
      ],
    });

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get a specific task by ID (owned or shared)
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user.id }, 
        { sharedWith: req.user.id }, 
      ],
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({ message: err.message });
  }
});

// Update a task (owned or shared)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user.id }, 
        { sharedWith: req.user.id }, 
      ],
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed = req.body.completed;

    if (task.recurring) {
      task.nextDueDate = getNextDueDate(task.frequency);
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(400).json({ message: err.message });
  }
});

// Delete a task (owned or shared)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user.id }, 
        { sharedWith: req.user.id }, 
      ],
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.userId.toString() === req.user.id) {
      await Task.findByIdAndDelete(req.params.id);

      await User.findByIdAndUpdate(req.user.id, {
        $pull: { tasks: req.params.id },
      });
      res.json({ message: "Task deleted" });
    } else {
      task.sharedWith = task.sharedWith.filter(
        (userId) => userId.toString() !== req.user.id
      );
      await task.save();
      res.json({ message: "Task unshared for the user" });
    }
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
