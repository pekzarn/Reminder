const mongoose = require("mongoose");

const ReminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  reminderDateTime: {
    type: Date,
    required: true,
  },
  reminderType: {
    type: String,
    enum: ["once", "daily", "weekly", "monthly", "yearly"],
    default: "once",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  category: {
    type: String,
    enum: ["personal", "work", "health", "social", "other"],
    default: "personal",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  snoozeUntil: {
    type: Date,
  },
  notificationSent: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
ReminderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find due reminders
ReminderSchema.statics.findDueReminders = function () {
  const now = new Date();
  return this.find({
    isActive: true,
    isCompleted: false,
    reminderDateTime: { $lte: now },
    $or: [
      { snoozeUntil: { $exists: false } },
      { snoozeUntil: { $lte: now } }
    ]
  }).populate('user', 'username email');
};

// Instance method to snooze reminder
ReminderSchema.methods.snooze = function (minutes = 10) {
  const snoozeTime = new Date();
  snoozeTime.setMinutes(snoozeTime.getMinutes() + minutes);
  this.snoozeUntil = snoozeTime;
  return this.save();
};

// Instance method to complete reminder
ReminderSchema.methods.complete = function () {
  this.isCompleted = true;
  this.completedAt = new Date();
  return this.save();
};

// Instance method to get next occurrence for recurring reminders
ReminderSchema.methods.getNextOccurrence = function () {
  if (this.reminderType === 'once') return null;

  const next = new Date(this.reminderDateTime);

  switch (this.reminderType) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
};

module.exports = mongoose.model("Reminder", ReminderSchema);