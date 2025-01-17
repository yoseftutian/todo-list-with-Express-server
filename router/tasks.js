const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// Create a new task (POST /tasks)
router.post("/", async (req, res) => {
  const task = new Task({
    title: req.body.title,
  });
  try {
    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all tasks (GET /tasks)
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task status (PUT /tasks/:id)
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task == null) {
      return res.status(404).json({ message: "Task not found" });
    }
    task.completed = req.body.completed ?? task.completed;
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a task (DELETE /tasks/:id)
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task == null) {
      return res.status(404).json({ message: "Task not found" });
    }
    await task.remove();
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
