const express = require("express");
const router = express.Router();
const Reminder = require("../models/Reminder");
const auth = require("../middleware/auth");

// GET: Get all reminders for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const { status, category, priority } = req.query;

    // Build filter query
    let filter = { user: req.user };

    if (status === 'active') {
      filter.isActive = true;
      filter.isCompleted = false;
    } else if (status === 'completed') {
      filter.isCompleted = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    const reminders = await Reminder.find(filter).sort({ reminderDateTime: 1 });
    res.json(reminders);
  } catch (err) {
    console.error('Get reminders error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET: Get due reminders for user
router.get("/due", auth, async (req, res) => {
  try {
    const now = new Date();
    const dueReminders = await Reminder.find({
      user: req.user,
      isActive: true,
      isCompleted: false,
      reminderDateTime: { $lte: now },
      $or: [
        { snoozeUntil: { $exists: false } },
        { snoozeUntil: { $lte: now } }
      ]
    }).sort({ reminderDateTime: 1 });

    res.json(dueReminders);
  } catch (err) {
    console.error('Get due reminders error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET: Get upcoming reminders (next 24 hours)
router.get("/upcoming", auth, async (req, res) => {
  try {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingReminders = await Reminder.find({
      user: req.user,
      isActive: true,
      isCompleted: false,
      reminderDateTime: {
        $gt: now,
        $lte: tomorrow
      }
    }).sort({ reminderDateTime: 1 });

    res.json(upcomingReminders);
  } catch (err) {
    console.error('Get upcoming reminders error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST: Create new reminder
router.post("/", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      reminderDateTime,
      reminderType,
      priority,
      category
    } = req.body;

    // Validate required fields
    if (!title || !reminderDateTime) {
      return res.status(400).json({
        message: "Title and reminder date/time are required"
      });
    }

    // Validate reminder date is in the future
    const reminderDate = new Date(reminderDateTime);
    if (reminderDate <= new Date()) {
      return res.status(400).json({
        message: "Reminder date must be in the future"
      });
    }

    const newReminder = new Reminder({
      user: req.user,
      title,
      description,
      reminderDateTime: reminderDate,
      reminderType: reminderType || "once",
      priority: priority || "medium",
      category: category || "personal"
    });

    const savedReminder = await newReminder.save();
    res.status(201).json(savedReminder);
  } catch (err) {
    console.error('Create reminder error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT: Update reminder
router.put("/:id", auth, async (req, res) => {
  try {
    const {
      title,
      description,
      reminderDateTime,
      reminderType,
      priority,
      category,
      isActive
    } = req.body;

    // Validate reminder date if provided
    if (reminderDateTime) {
      const reminderDate = new Date(reminderDateTime);
      if (reminderDate <= new Date()) {
        return res.status(400).json({
          message: "Reminder date must be in the future"
        });
      }
    }

    const updatedReminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user: req.user },
      {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(reminderDateTime && { reminderDateTime: new Date(reminderDateTime) }),
        ...(reminderType && { reminderType }),
        ...(priority && { priority }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedReminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.json(updatedReminder);
  } catch (err) {
    console.error('Update reminder error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT: Complete reminder
router.put("/:id/complete", auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    await reminder.complete();

    // Handle recurring reminders
    if (reminder.reminderType !== 'once') {
      const nextOccurrence = reminder.getNextOccurrence();
      if (nextOccurrence) {
        const newReminder = new Reminder({
          user: reminder.user,
          title: reminder.title,
          description: reminder.description,
          reminderDateTime: nextOccurrence,
          reminderType: reminder.reminderType,
          priority: reminder.priority,
          category: reminder.category
        });
        await newReminder.save();
      }
    }

    res.json({ message: "Reminder completed successfully", reminder });
  } catch (err) {
    console.error('Complete reminder error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT: Snooze reminder
router.put("/:id/snooze", auth, async (req, res) => {
  try {
    const { minutes = 10 } = req.body;

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    await reminder.snooze(minutes);
    res.json({ message: `Reminder snoozed for ${minutes} minutes`, reminder });
  } catch (err) {
    console.error('Snooze reminder error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE: Delete reminder
router.delete("/:id", auth, async (req, res) => {
  try {
    const deletedReminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user,
    });

    if (!deletedReminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    res.json({ message: "Reminder deleted successfully" });
  } catch (err) {
    console.error('Delete reminder error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET: Get reminder statistics
router.get("/stats", auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    const stats = await Promise.all([
      // Total reminders
      Reminder.countDocuments({ user: req.user }),

      // Active reminders
      Reminder.countDocuments({ user: req.user, isActive: true, isCompleted: false }),

      // Completed reminders
      Reminder.countDocuments({ user: req.user, isCompleted: true }),

      // Due reminders
      Reminder.countDocuments({
        user: req.user,
        isActive: true,
        isCompleted: false,
        reminderDateTime: { $lte: now },
        $or: [
          { snoozeUntil: { $exists: false } },
          { snoozeUntil: { $lte: now } }
        ]
      }),

      // Today's reminders
      Reminder.countDocuments({
        user: req.user,
        reminderDateTime: { $gte: startOfToday, $lt: endOfToday }
      }),

      // Reminders by category
      Reminder.aggregate([
        { $match: { user: req.user } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),

      // Reminders by priority
      Reminder.aggregate([
        { $match: { user: req.user } },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      total: stats[0],
      active: stats[1],
      completed: stats[2],
      due: stats[3],
      today: stats[4],
      byCategory: stats[5],
      byPriority: stats[6]
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;