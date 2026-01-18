// FocusBlocks Statistics Utilities
// Helper functions for calculating statistics

// Get start of day
export const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Get end of day
export const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Get start of week (Monday)
export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Get end of week (Sunday)
export const getEndOfWeek = (date) => {
  const d = getStartOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Get start of month
export const getStartOfMonth = (date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Get end of month
export const getEndOfMonth = (date) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Format date as YYYY-MM-DD
export const formatDateString = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Calculate total focus time from sessions (in seconds)
export const calculateTotalFocusTime = (sessions) => {
  return sessions
    .filter(s => s.type === 'finish')
    .reduce((total, s) => total + (s.elapsedSeconds || 0), 0);
};

// Calculate session count
export const calculateSessionCount = (sessions) => {
  return sessions.filter(s => s.type === 'finish').length;
};

// Calculate daily statistics
export const calculateDayStats = (sessions, blocks, date) => {
  const dateStr = formatDateString(date);

  // Filter sessions for this day
  const daySessions = sessions.filter(s =>
    s.timestamp.startsWith(dateStr) && s.type === 'finish'
  );

  // Filter completed blocks for this day
  const completedBlocks = blocks.filter(b =>
    b.scheduledDate === dateStr && b.status === 'completed'
  );

  const totalSeconds = calculateTotalFocusTime(daySessions);
  const sessionCount = daySessions.length;

  return {
    date: dateStr,
    totalMinutes: Math.floor(totalSeconds / 60),
    totalSeconds,
    sessionCount,
    completedBlocks: completedBlocks.length,
  };
};

// Calculate weekly statistics
export const calculateWeekStats = (sessions, blocks, date) => {
  const weekStart = getStartOfWeek(date);
  const weekEnd = getEndOfWeek(date);
  const startStr = formatDateString(weekStart);
  const endStr = formatDateString(weekEnd);

  // Filter sessions for this week
  const weekSessions = sessions.filter(s => {
    const sessionDate = s.timestamp.split('T')[0];
    return sessionDate >= startStr && sessionDate <= endStr && s.type === 'finish';
  });

  // Filter completed blocks for this week
  const completedBlocks = blocks.filter(b => {
    return b.scheduledDate >= startStr && b.scheduledDate <= endStr && b.status === 'completed';
  });

  const totalSeconds = calculateTotalFocusTime(weekSessions);

  return {
    startDate: startStr,
    endDate: endStr,
    totalMinutes: Math.floor(totalSeconds / 60),
    totalSeconds,
    sessionCount: weekSessions.length,
    completedBlocks: completedBlocks.length,
  };
};

// Calculate monthly statistics
export const calculateMonthStats = (sessions, blocks, date) => {
  const monthStart = getStartOfMonth(date);
  const monthEnd = getEndOfMonth(date);
  const startStr = formatDateString(monthStart);
  const endStr = formatDateString(monthEnd);

  // Filter sessions for this month
  const monthSessions = sessions.filter(s => {
    const sessionDate = s.timestamp.split('T')[0];
    return sessionDate >= startStr && sessionDate <= endStr && s.type === 'finish';
  });

  // Filter completed blocks for this month
  const completedBlocks = blocks.filter(b => {
    return b.scheduledDate >= startStr && b.scheduledDate <= endStr && b.status === 'completed';
  });

  const totalSeconds = calculateTotalFocusTime(monthSessions);

  return {
    month: monthStart.getMonth(),
    year: monthStart.getFullYear(),
    totalMinutes: Math.floor(totalSeconds / 60),
    totalSeconds,
    sessionCount: monthSessions.length,
    completedBlocks: completedBlocks.length,
  };
};

// Calculate goal progress percentage
export const calculateGoalProgress = (totalMinutes, dailyGoalMinutes) => {
  if (dailyGoalMinutes <= 0) return 0;
  const progress = (totalMinutes / dailyGoalMinutes) * 100;
  return Math.min(100, Math.round(progress));
};

// Calculate streak (consecutive days with at least one completed session)
export const calculateStreak = (sessions) => {
  if (sessions.length === 0) return 0;

  // Get unique dates with completed sessions
  const datesWithSessions = new Set(
    sessions
      .filter(s => s.type === 'finish')
      .map(s => s.timestamp.split('T')[0])
  );

  if (datesWithSessions.size === 0) return 0;

  // Sort dates
  const sortedDates = Array.from(datesWithSessions).sort().reverse();

  let streak = 0;
  const today = formatDateString(new Date());
  const yesterday = formatDateString(new Date(Date.now() - 86400000));

  // Check if today or yesterday has a session (streak can start from either)
  if (!datesWithSessions.has(today) && !datesWithSessions.has(yesterday)) {
    return 0;
  }

  // Count consecutive days
  let currentDate = datesWithSessions.has(today) ? new Date() : new Date(Date.now() - 86400000);

  while (datesWithSessions.has(formatDateString(currentDate))) {
    streak++;
    currentDate = new Date(currentDate.getTime() - 86400000);
  }

  return streak;
};

// Get sessions grouped by block
export const getSessionsByBlock = (sessions, blockId) => {
  return sessions.filter(s => s.blockId === blockId);
};

// Format duration for display
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
};

// Format time (seconds) as MM:SS
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Format time (seconds) as HH:MM:SS for longer durations
export const formatTimeWithHours = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Get week days for calendar display
export const getWeekDays = (date) => {
  const weekStart = getStartOfWeek(date);
  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    days.push({
      date: d,
      dateStr: formatDateString(d),
      dayOfWeek: d.getDay(),
      dayOfMonth: d.getDate(),
      isToday: formatDateString(d) === formatDateString(new Date()),
    });
  }

  return days;
};

// Get calendar month data
export const getCalendarMonth = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  // Get the day of week for the first day (0 = Sunday)
  let startDayOfWeek = firstDay.getDay();
  // Adjust to Monday-based week
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const weeks = [];
  let currentWeek = [];

  // Add empty days for the start of the first week
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    currentWeek.push({
      date,
      dateStr: formatDateString(date),
      dayOfMonth: day,
      isToday: formatDateString(date) === formatDateString(new Date()),
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Fill the last week with empty days
  while (currentWeek.length > 0 && currentWeek.length < 7) {
    currentWeek.push(null);
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return {
    year,
    month,
    monthName: firstDay.toLocaleDateString('en-US', { month: 'long' }),
    weeks,
  };
};
