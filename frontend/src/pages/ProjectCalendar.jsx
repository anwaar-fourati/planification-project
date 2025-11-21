import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectEvents, createEvent, updateEvent, deleteEvent } from '../services/calendarService';
import { getProjectDetails } from '../services/projectService';
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ClockIcon,
  MapPinIcon,
  LinkIcon,
  TrashIcon,
  PencilIcon,
  CalendarDaysIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// GlassCard Component
const GlassCard = ({ children, className = "" }) => {
  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-200/50 dark:border-purple-700/50 ${className}`}>
      {children}
    </div>
  );
};

const ProjectCalendar = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [filterType, setFilterType] = useState('all');
  
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: 'meeting',
    dateDebut: '',
    dateFin: '',
    lieu: '',
    lien: '',
    couleur: '#8B5CF6',
    touteJournee: false,
    notes: '',
    recurrence: 'none'
  });

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
      fetchEvents();
    }
  }, [projectId, currentDate, filterType]);

  const fetchProjectDetails = async () => {
    try {
      const projet = await getProjectDetails(projectId);
      setProjectData(projet);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les détails du projet');
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const filters = {
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
        type: filterType
      };
      
      const data = await getProjectEvents(projectId, filters);
      setEvents(data.evenements || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingEvent) {
        await updateEvent(editingEvent._id, formData);
      } else {
        await createEvent(projectId, formData);
      }
      
      await fetchEvents();
      setShowEventModal(false);
      resetForm();
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteEvent(eventId);
      await fetchEvents();
    } catch (err) {
      console.error('Erreur:', err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      titre: event.titre,
      description: event.description || '',
      type: event.type,
      dateDebut: new Date(event.dateDebut).toISOString().slice(0, 16),
      dateFin: new Date(event.dateFin).toISOString().slice(0, 16),
      lieu: event.lieu || '',
      lien: event.lien || '',
      couleur: event.couleur || '#8B5CF6',
      touteJournee: event.touteJournee || false,
      notes: event.notes || '',
      recurrence: event.recurrence || 'none'
    });
    setShowEventModal(true);
  };

  const resetForm = () => {
    setEditingEvent(null);
    setFormData({
      titre: '',
      description: '',
      type: 'meeting',
      dateDebut: '',
      dateFin: '',
      lieu: '',
      lien: '',
      couleur: '#8B5CF6',
      touteJournee: false,
      notes: '',
      recurrence: 'none'
    });
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().slice(0, 16);
    setFormData(prev => ({
      ...prev,
      dateDebut: dateStr,
      dateFin: dateStr
    }));
    setShowEventModal(true);
  };

  // Calendar generation
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.dateDebut);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const getEventTypeColor = (type) => {
    const colors = {
      meeting: 'bg-purple-500',
      task: 'bg-blue-500',
      reminder: 'bg-yellow-500',
      deadline: 'bg-red-500',
      other: 'bg-gray-500'
    };
    return colors[type] || colors.other;
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      meeting: 'Meeting',
      task: 'Task',
      reminder: 'Reminder',
      deadline: 'Deadline',
      other: 'Other'
    };
    return labels[type] || 'Other';
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full min-h-screen p-6" style={{ background: "var(--page-bg)" }}>
      <div className="relative space-y-6 w-full max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button 
              onClick={() => navigate(`/projects/${projectId}/tasks`)}
              className="text-sm hover:underline mb-2 transition-colors"
              style={{ color: "var(--sidebar-icon)" }}
            >
              ← Back to Tasks
            </button>
            <h2 className="text-3xl font-bold" style={{ color: "var(--text-main)" }}>Project Calendar</h2>
            <p className="text-md" style={{ color: "var(--sidebar-text)" }}>
              {projectData?.nom || 'Loading...'}
            </p>
          </div>
          
          <button 
            onClick={() => {
              resetForm();
              setShowEventModal(true);
            }}
            className="flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl text-white"
            style={{ background: "linear-gradient(135deg, #8C79D9 0%, #A78BFA 100%)" }}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Event
          </button>
        </div>

        {/* CALENDAR CONTROLS */}
        <GlassCard className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Month Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  background: "var(--box-bg)",
                  color: "var(--sidebar-icon)"
                }}
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>
              
              <h3 className="text-xl font-bold min-w-[200px] text-center" style={{ color: "var(--text-main)" }}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  background: "var(--box-bg)",
                  color: "var(--sidebar-icon)"
                }}
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Today Button */}
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 py-2 rounded-lg transition-colors text-white"
              style={{ background: "#8C79D9" }}
            >
              Today
            </button>

            {/* Filter by Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none"
              style={{ 
                background: "var(--box-bg)",
                color: "var(--text-main)",
                borderColor: "rgba(140, 121, 217, 0.3)"
              }}
            >
              <option value="all">All Types</option>
              <option value="meeting">Meetings</option>
              <option value="task">Tasks</option>
              <option value="reminder">Reminders</option>
              <option value="deadline">Deadlines</option>
              <option value="other">Other</option>
            </select>
          </div>
        </GlassCard>

        {/* CALENDAR GRID */}
        <GlassCard className="p-6">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {dayNames.map(day => (
              <div key={day} className="text-center font-semibold py-2" style={{ color: "var(--sidebar-text)" }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              const isToday = day.date.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  onClick={() => day.isCurrentMonth && handleDateClick(day.date)}
                  className={`
                    min-h-[100px] p-2 rounded-lg border transition-all cursor-pointer
                    ${day.isCurrentMonth 
                      ? 'hover:shadow-md' 
                      : 'opacity-50'
                    }
                    ${isToday ? 'border-2 shadow-md' : ''}
                  `}
                  style={{
                    background: day.isCurrentMonth ? "var(--box-bg)" : "rgba(236, 232, 248, 0.3)",
                    borderColor: isToday ? "#8C79D9" : "rgba(140, 121, 217, 0.2)"
                  }}
                >
                  <div className={`text-sm font-semibold mb-1`} style={{ color: isToday ? "#8C79D9" : "var(--text-main)" }}>
                    {day.date.getDate()}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <div
                        key={event._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(event);
                        }}
                        className="text-xs p-1 rounded truncate text-white hover:opacity-80 transition-opacity"
                        style={{ background: event.couleur || "#8C79D9" }}
                        title={event.titre}
                      >
                        {event.titre}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs pl-1" style={{ color: "var(--sidebar-text)" }}>
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* EVENT MODAL */}
        {showEventModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <GlassCard className="w-full max-w-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>
                  {editingEvent ? 'Edit Event' : 'Create New Event'}
                </h3>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    resetForm();
                  }}
                  className="p-2 rounded-lg transition-colors"
                  style={{ 
                    background: "var(--box-bg)",
                    color: "var(--sidebar-text)"
                  }}
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: "var(--sidebar-text)" }}>
                    Title <span className="text-pink-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="titre"
                    required
                    value={formData.titre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 border"
                    style={{ 
                      background: "var(--box-bg)",
                      color: "var(--text-main)",
                      borderColor: "rgba(140, 121, 217, 0.3)"
                    }}
                    placeholder="e.g., Sprint Planning Meeting"
                  />
                </div>

                {/* Type and Color */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: "var(--sidebar-text)" }}>
                      Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 border"
                      style={{ 
                        background: "var(--box-bg)",
                        color: "var(--text-main)",
                        borderColor: "rgba(140, 121, 217, 0.3)"
                      }}
                    >
                      <option value="meeting">Meeting</option>
                      <option value="task">Task</option>
                      <option value="reminder">Reminder</option>
                      <option value="deadline">Deadline</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Color
                    </label>
                    <input
                      type="color"
                      name="couleur"
                      value={formData.couleur}
                      onChange={handleInputChange}
                      className="w-full h-12 rounded-xl cursor-pointer"
                    />
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Start Date & Time <span className="text-pink-600">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="dateDebut"
                      required
                      value={formData.dateDebut}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      End Date & Time <span className="text-pink-600">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="dateFin"
                      required
                      value={formData.dateFin}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>

                {/* All Day & Recurrence */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="touteJournee"
                      checked={formData.touteJournee}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <label className="ml-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      All Day Event
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Recurrence
                    </label>
                    <select
                      name="recurrence"
                      value={formData.recurrence}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                    >
                      <option value="none">No Repeat</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                    placeholder="Event details..."
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <input
                    type="text"
                    name="lieu"
                    value={formData.lieu}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                    placeholder="e.g., Conference Room A"
                  />
                </div>

                {/* Meeting Link */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    name="lien"
                    value={formData.lien}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                    placeholder="https://meet.google.com/..."
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    rows="2"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-300 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
                    placeholder="Additional notes..."
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between pt-6">
                  {editingEvent && (
                    <button
                      type="button"
                      onClick={() => handleDelete(editingEvent._id)}
                      className="px-6 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
                      disabled={loading}
                    >
                      Delete Event
                    </button>
                  )}
                  
                  <div className="flex space-x-3 ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEventModal(false);
                        resetForm();
                      }}
                      className="px-6 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 transition-colors"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
                    </button>
                  </div>
                </div>
              </form>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCalendar;