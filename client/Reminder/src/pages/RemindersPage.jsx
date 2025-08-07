import { useState, useContext, useEffect } from "react";

const RemindersPage = () => {
  // Mock user and reminder context for demonstration
  const user = { username: "John Doe" };
  const [reminders, setReminders] = useState([
    {
      _id: "1",
      title: "Meeting with team",
      description: "Discuss project progress",
      reminderDateTime: new Date(Date.now() + 3600000).toISOString(),
      reminderType: "once",
      priority: "high",
      category: "work",
      isCompleted: false,
      isActive: true
    },
    {
      _id: "2",
      title: "Take medication",
      description: "Morning vitamins",
      reminderDateTime: new Date(Date.now() - 3600000).toISOString(),
      reminderType: "daily",
      priority: "high",
      category: "health",
      isCompleted: false,
      isActive: true
    }
  ]);

  const [stats, setStats] = useState({
    total: 2,
    active: 2,
    due: 1,
    completed: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    priority: "all"
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    reminderDateTime: "",
    reminderType: "once",
    priority: "medium",
    category: "personal"
  });

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString();
  };

  const formatDateTimeInput = (dateTime) => {
    const date = new Date(dateTime);
    return date.toISOString().slice(0, 16);
  };

  const isPastDue = (dateTime) => {
    return new Date(dateTime) < new Date();
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    };
    return colors[priority] || colors.medium;
  };

  const getCategoryColor = (category) => {
    const colors = {
      personal: "bg-blue-100 text-blue-800",
      work: "bg-purple-100 text-purple-800",
      health: "bg-pink-100 text-pink-800",
      social: "bg-indigo-100 text-indigo-800",
      other: "bg-gray-100 text-gray-800"
    };
    return colors[category] || colors.other;
  };

  const handleCreateReminder = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const newReminder = {
        _id: Date.now().toString(),
        ...formData,
        isCompleted: false,
        isActive: true
      };

      setReminders(prev => [...prev, newReminder]);
      setStats(prev => ({ ...prev, total: prev.total + 1, active: prev.active + 1 }));
      setShowCreateModal(false);
      setFormData({
        title: "",
        description: "",
        reminderDateTime: "",
        reminderType: "once",
        priority: "medium",
        category: "personal"
      });
      setLoading(false);
    }, 500);
  };

  const handleEditReminder = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setReminders(prev =>
        prev.map(reminder =>
          reminder._id === editingReminder._id
            ? { ...reminder, ...formData }
            : reminder
        )
      );

      setShowEditModal(false);
      setEditingReminder(null);
      setFormData({
        title: "",
        description: "",
        reminderDateTime: "",
        reminderType: "once",
        priority: "medium",
        category: "personal"
      });
      setLoading(false);
    }, 500);
  };

  const openEditModal = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description || "",
      reminderDateTime: formatDateTimeInput(reminder.reminderDateTime),
      reminderType: reminder.reminderType,
      priority: reminder.priority,
      category: reminder.category
    });
    setShowEditModal(true);
  };

  const completeReminder = (id) => {
    setReminders(prev =>
      prev.map(reminder =>
        reminder._id === id
          ? { ...reminder, isCompleted: true }
          : reminder
      )
    );
    setStats(prev => ({
      ...prev,
      active: prev.active - 1,
      completed: prev.completed + 1
    }));
  };

  const snoozeReminder = (id, minutes = 10) => {
    console.log(`Snoozed reminder ${id} for ${minutes} minutes`);
  };

  const deleteReminder = (id) => {
    const reminder = reminders.find(r => r._id === id);
    setReminders(prev => prev.filter(r => r._id !== id));
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      active: reminder && !reminder.isCompleted ? prev.active - 1 : prev.active,
      completed: reminder && reminder.isCompleted ? prev.completed - 1 : prev.completed
    }));
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
  };

  const getFilteredReminders = () => {
    let filtered = reminders;

    // Apply tab filter
    switch (activeTab) {
      case "due":
        filtered = filtered.filter(r => isPastDue(r.reminderDateTime) && !r.isCompleted);
        break;
      case "upcoming":
        filtered = filtered.filter(r => !isPastDue(r.reminderDateTime) && !r.isCompleted);
        break;
      case "completed":
        filtered = filtered.filter(r => r.isCompleted);
        break;
      default:
        break;
    }

    // Apply other filters
    if (filters.category !== "all") {
      filtered = filtered.filter(r => r.category === filters.category);
    }

    if (filters.priority !== "all") {
      filtered = filtered.filter(r => r.priority === filters.priority);
    }

    return filtered;
  };

  const clearError = () => setError(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.username}!
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Reminders</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Active</h3>
            <p className="text-3xl font-bold text-green-600">{stats.active || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Due Now</h3>
            <p className="text-3xl font-bold text-red-600">{stats.due || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.completed || 0}</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: "all", label: "All" },
                { id: "due", label: "Due" },
                { id: "upcoming", label: "Upcoming" },
                { id: "completed", label: "Completed" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="health">Health</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                + Add Reminder
              </button>
            </div>
          </div>
        </div>

        {/* Reminders List */}
        <div className="bg-white rounded-xl shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : getFilteredReminders().length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No reminders found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Reminder
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {getFilteredReminders().map((reminder) => (
                <div key={reminder._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-semibold ${reminder.isCompleted
                          ? "text-gray-500 line-through"
                          : isPastDue(reminder.reminderDateTime) && !reminder.isCompleted
                            ? "text-red-600"
                            : "text-gray-900"
                          }`}>
                          {reminder.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                          {reminder.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(reminder.category)}`}>
                          {reminder.category}
                        </span>
                        {reminder.reminderType !== "once" && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {reminder.reminderType}
                          </span>
                        )}
                      </div>

                      {reminder.description && (
                        <p className="text-gray-600 mb-2">{reminder.description}</p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Due: {formatDateTime(reminder.reminderDateTime)}</span>
                        {isPastDue(reminder.reminderDateTime) && !reminder.isCompleted && (
                          <span className="text-red-600 font-medium">OVERDUE</span>
                        )}
                        {reminder.snoozeUntil && (
                          <span className="text-orange-600">Snoozed until {formatDateTime(reminder.snoozeUntil)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {!reminder.isCompleted && (
                        <>
                          <button
                            onClick={() => completeReminder(reminder._id)}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                          >
                            Complete
                          </button>
                          {isPastDue(reminder.reminderDateTime) && (
                            <button
                              onClick={() => snoozeReminder(reminder._id, 10)}
                              className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors"
                            >
                              Snooze
                            </button>
                          )}
                        </>
                      )}

                      <button
                        onClick={() => openEditModal(reminder)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteReminder(reminder._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New Reminder</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.reminderDateTime}
                  onChange={(e) => setFormData({ ...formData, reminderDateTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.reminderType}
                    onChange={(e) => setFormData({ ...formData, reminderType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="health">Health</option>
                  <option value="social">Social</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateReminder}
                  disabled={loading || !formData.title || !formData.reminderDateTime}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Reminder"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Edit Reminder</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.reminderDateTime}
                  onChange={(e) => setFormData({ ...formData, reminderDateTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.reminderType}
                    onChange={(e) => setFormData({ ...formData, reminderType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="health">Health</option>
                  <option value="social">Social</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingReminder(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleEditReminder}
                  disabled={loading || !formData.title || !formData.reminderDateTime}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersPage;
