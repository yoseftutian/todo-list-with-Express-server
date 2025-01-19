const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
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
