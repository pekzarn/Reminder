import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const ReminderContext = createContext();

export const ReminderProvider = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [reminders, setReminders] = useState([]);
  const [dueReminders, setDueReminders] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = "http://localhost:5000/api/reminders";

  // Create axios instance with auth header
  const createAxiosConfig = () => ({
    headers: {
      Authorization: token,
    },
  });

  // Fetch all reminders
  const fetchReminders = async (filters = {}) => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);

      const queryString = params.toString();
      const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;

      const response = await axios.get(url, createAxiosConfig());
      setReminders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch reminders");
      console.error("Fetch reminders error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch due reminders
  const fetchDueReminders = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${API_BASE}/due`, createAxiosConfig());
      setDueReminders(response.data);
    } catch (err) {
      console.error("Fetch due reminders error:", err);
    }
  };

  // Fetch upcoming reminders
  const fetchUpcomingReminders = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${API_BASE}/upcoming`, createAxiosConfig());
      setUpcomingReminders(response.data);
    } catch (err) {
      console.error("Fetch upcoming reminders error:", err);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${API_BASE}/stats`, createAxiosConfig());
      setStats(response.data);
    } catch (err) {
      console.error("Fetch stats error:", err);
    }
  };

  // Create reminder
  const createReminder = async (reminderData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(API_BASE, reminderData, createAxiosConfig());

      // Refresh data
      await Promise.all([
        fetchReminders(),
        fetchDueReminders(),
        fetchUpcomingReminders(),
        fetchStats()
      ]);

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to create reminder";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Update reminder
  const updateReminder = async (id, updates) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(`${API_BASE}/${id}`, updates, createAxiosConfig());

      // Update local state
      setReminders(prev =>
        prev.map(reminder =>
          reminder._id === id ? response.data : reminder
        )
      );

      // Refresh related data
      await Promise.all([
        fetchDueReminders(),
        fetchUpcomingReminders(),
        fetchStats()
      ]);

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to update reminder";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Complete reminder
  const completeReminder = async (id) => {
    try {
      await axios.put(`${API_BASE}/${id}/complete`, {}, createAxiosConfig());

      // Refresh data
      await Promise.all([
        fetchReminders(),
        fetchDueReminders(),
        fetchUpcomingReminders(),
        fetchStats()
      ]);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to complete reminder";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Snooze reminder
  const snoozeReminder = async (id, minutes = 10) => {
    try {
      await axios.put(`${API_BASE}/${id}/snooze`, { minutes }, createAxiosConfig());

      // Refresh due reminders
      await fetchDueReminders();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to snooze reminder";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete reminder
  const deleteReminder = async (id) => {
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_BASE}/${id}`, createAxiosConfig());

      // Remove from local state
      setReminders(prev => prev.filter(reminder => reminder._id !== id));
      setDueReminders(prev => prev.filter(reminder => reminder._id !== id));
      setUpcomingReminders(prev => prev.filter(reminder => reminder._id !== id));

      // Refresh stats
      await fetchStats();
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to delete reminder";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh due reminders every minute when user is authenticated
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetchDueReminders();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [token]);

  // Initial data fetch when token changes
  useEffect(() => {
    if (token) {
      Promise.all([
        fetchReminders(),
        fetchDueReminders(),
        fetchUpcomingReminders(),
        fetchStats()
      ]);
    } else {
      // Clear data when logged out
      setReminders([]);
      setDueReminders([]);
      setUpcomingReminders([]);
      setStats({});
    }
  }, [token]);

  const value = {
    // State
    reminders,
    dueReminders,
    upcomingReminders,
    stats,
    loading,
    error,

    // Actions
    fetchReminders,
    fetchDueReminders,
    fetchUpcomingReminders,
    fetchStats,
    createReminder,
    updateReminder,
    completeReminder,
    snoozeReminder,
    deleteReminder,

    // Utils
    clearError: () => setError(null),
  };

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
};