const Reminder = require("../models/Reminder");

class NotificationService {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.checkInterval = 60000; // Check every minute
  }

  // Start the notification service
  start() {
    if (this.isRunning) {
      console.log('Notification service is already running');
      return;
    }

    console.log('Starting notification service...');
    this.isRunning = true;

    // Run immediately on start
    this.checkForDueReminders();

    // Set up interval to check periodically
    this.interval = setInterval(() => {
      this.checkForDueReminders();
    }, this.checkInterval);

    console.log(`Notification service started - checking every ${this.checkInterval / 1000} seconds`);
  }

  // Stop the notification service
  stop() {
    if (!this.isRunning) {
      console.log('Notification service is not running');
      return;
    }

    console.log('Stopping notification service...');
    this.isRunning = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    console.log('Notification service stopped');
  }

  // Check for due reminders and send notifications
  async checkForDueReminders() {
    try {
      const dueReminders = await Reminder.findDueReminders();

      if (dueReminders.length === 0) {
        return;
      }

      console.log(`Found ${dueReminders.length} due reminders`);

      for (const reminder of dueReminders) {
        if (!reminder.notificationSent) {
          await this.sendNotification(reminder);

          // Mark notification as sent
          reminder.notificationSent = true;
          await reminder.save();
        }
      }
    } catch (error) {
      console.error('Error checking for due reminders:', error);
    }
  }

  // Send notification
  async sendNotification(reminder) {
    try {
      // Log notification (replaceable with email, push notification, etc.)
      console.log('\n=== REMINDER NOTIFICATION ===');
      console.log(`User: ${reminder.user.username} (${reminder.user.email})`);
      console.log(`Title: ${reminder.title}`);
      console.log(`Description: ${reminder.description || 'No description'}`);
      console.log(`Priority: ${reminder.priority}`);
      console.log(`Category: ${reminder.category}`);
      console.log(`Due: ${reminder.reminderDateTime}`);
      console.log('=============================\n');

      // 1. Email notifications
      // await this.sendEmailNotification(reminder);

      // 2. Push notifications
      // await this.sendPushNotification(reminder);

      // 3. SMS notifications
      // await this.sendSMSNotification(reminder);

      // 4. In-app notifications (store in database)
      await this.createInAppNotification(reminder);

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Create in-app notification (stored in database for real-time display)
  async createInAppNotification(reminder) {
    console.log(`Created in-app notification for reminder: ${reminder.title}`);
  }

  // Email notification (example implementation)
  async sendEmailNotification(reminder) {
    // Implement with nodemailer or your preferred email service
    console.log(`Would send email to ${reminder.user.email} about: ${reminder.title}`);
  }

  // Push notification (example implementation)
  async sendPushNotification(reminder) {
    // Implement with services like Firebase Cloud Messaging
    console.log(`Would send push notification about: ${reminder.title}`);
  }

  // SMS notification (example implementation)
  async sendSMSNotification(reminder) {
    // Implement with services like Twilio
    console.log(`Would send SMS about: ${reminder.title}`);
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      lastCheck: new Date().toISOString()
    };
  }

  // Update check interval
  setCheckInterval(intervalMs) {
    this.checkInterval = intervalMs;

    if (this.isRunning) {
      // Restart with new interval
      this.stop();
      this.start();
    }
  }

  // Manual trigger for testing
  async triggerCheck() {
    console.log('Manually triggering reminder check...');
    await this.checkForDueReminders();
  }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;