const mongoose = require("mongoose");

// Define Task schema
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "weekly",
    },
    nextDueDate: Date,
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user IDs
  },
  { timestamps: true }
);

// Query Middleware
taskSchema.pre(
  ["find", "findOne", "findOneAndDelete", "findOneAndUpdate"],
  function (next) {
    if (!this.getQuery().userId && this.options && this.options.user) {
      this.where({ userId: this.options.user.id });
    }
    next();
  }
);

module.exports = mongoose.model("Task", taskSchema);
