// FocusBlocks Data Models

// Generate unique IDs
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// User model
export const createUser = (data = {}) => ({
  id: generateId(),
  email: data.email || '',
  name: data.name || 'User',
  avatar: data.avatar || null,
  createdAt: new Date().toISOString(),
  ...data,
});

// Project model
export const createProject = (data = {}) => ({
  id: generateId(),
  name: data.name || 'New Project',
  description: data.description || '',
  color: data.color || 'orange',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...data,
});

// Block model
export const createBlock = (data = {}) => ({
  id: generateId(),
  title: data.title || '',
  duration: data.duration || 25, // minutes
  category: data.category || 'work',
  color: data.color || 'orange',
  projectId: data.projectId || null,
  notes: data.notes || '',
  scheduledDate: data.scheduledDate || new Date().toISOString().split('T')[0],
  scheduledTime: data.scheduledTime || null,
  status: data.status || 'pending', // pending, active, completed
  order: data.order || 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...data,
});

// Session model - records actual focus time
export const createSession = (data = {}) => ({
  id: generateId(),
  blockId: data.blockId,
  type: data.type || 'start', // start, pause, resume, finish, skip
  timestamp: new Date().toISOString(),
  elapsedSeconds: data.elapsedSeconds || 0,
  ...data,
});

// Settings model
export const createSettings = (data = {}) => ({
  notifications: true,
  darkMode: false,
  dailyGoal: 360, // 6 hours in minutes
  autoStartNext: false,
  ...data,
});

// Timer state model
export const createTimerState = (data = {}) => ({
  blockId: data.blockId || null,
  isRunning: false,
  isPaused: false,
  startTimestamp: null,
  pauseTimestamp: null,
  totalPausedSeconds: 0,
  elapsedSeconds: 0,
  ...data,
});

// Statistics calculation helpers
export const calculateDayStats = (sessions, date) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  const daySessions = sessions.filter(s => {
    const sessionDate = new Date(s.timestamp);
    return sessionDate >= dayStart && sessionDate <= dayEnd && s.type === 'finish';
  });

  const totalSeconds = daySessions.reduce((acc, s) => acc + (s.elapsedSeconds || 0), 0);
  const sessionCount = daySessions.length;

  return {
    totalMinutes: Math.floor(totalSeconds / 60),
    sessionCount,
    date: date,
  };
};

export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
