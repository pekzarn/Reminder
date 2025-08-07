const express = require("express");
const cors = require("cors");
const connectDB = require("./config");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const reminderRoutes = require("./routes/reminders");
const notificationService = require("./services/notificationService");

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reminders", reminderRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.send("Reminder API is working!");
});

// Notification service status endpoint
app.get("/api/notification-status", (req, res) => {
  res.json(notificationService.getStatus());
});

// Manual trigger endpoint for testing notifications
app.post("/api/trigger-notifications", async (req, res) => {
  try {
    await notificationService.triggerCheck();
    res.json({ message: "Notification check triggered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error triggering notifications", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Start notification service after server starts
  setTimeout(() => {
    notificationService.start();
  }, 2000); // Wait 2 seconds for database connection to stabilize
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nReceived SIGINT. Gracefully shutting down...');
  notificationService.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM. Gracefully shutting down...');
  notificationService.stop();
  process.exit(0);
});