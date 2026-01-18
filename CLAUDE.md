# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm start          # Start Expo dev server
npm run ios        # Start with iOS Simulator
npm run android    # Start with Android Emulator

# Testing
npm test           # Run all tests
npm run test:watch # Run tests in watch mode
```

## Architecture

### State Management
React Context + useReducer pattern in `src/contexts/`:
- **AppContext**: Global state (user, projects, blocks, sessions, settings, timerState)
- **ThemeContext**: Dark/light mode theming

All state is persisted to AsyncStorage via `src/storage/index.js`.

### Navigation Structure
```
AppNavigator (Root)
└── TabNavigator (no authentication)
    ├── Timer → TimerScreen, EditBlock (modal), BlockDetail
    ├── Tasks → ProjectsScreen, ProjectDetail, EditBlock, BlockDetail
    ├── History → HistoryScreen, BlockDetail
    └── Settings → SettingsScreen, EditProfile
```

**Note**: Authentication flow was removed. App goes directly to TabNavigator.

### Data Models (`src/models/index.js`)
- **User**: id, email, name, avatar
- **Project**: id, name, description, color
- **Block**: id, title, duration, category, color, projectId, notes, scheduledDate, status, order
- **Session**: id, blockId, type (start/pause/resume/finish/skip), timestamp, elapsedSeconds

### Timer Architecture
Timer uses **timestamps** for background accuracy (not intervals):
- Records `startTimestamp` when started
- Tracks `totalPausedSeconds` for pause durations
- Recalculates elapsed time when app returns from background
- State persisted in `timerState` object in AppContext

**Critical**: Always use timestamp-based calculations in TimerService, never rely on setInterval for accuracy.

### Services (`src/services/`)
- **TimerService**: Background timing, AppState handling
- **NotificationService**: expo-notifications for block completion
  - **Important**: Configured to NOT show notifications when app is in foreground
  - Only shows when app is backgrounded/locked and timer completes
  - Must call `initialize()` once at app startup (done in App.js)
  - Always cancel previous notifications before scheduling new ones

### Notification Behavior
The app uses a specific notification pattern:
- When app is **open/foreground**: No notifications shown (user sees timer)
- When app is **closed/background**: Notifications appear when timer completes
- When phone is **locked**: Notifications work with high priority settings

`setNotificationHandler` is configured with `shouldShowBanner: false` and `shouldShowList: false` to prevent foreground notifications.

## Design System (`src/theme/`)

### Colors
- Primary: Coral (#D4714A light, #E5A63D dark)
- Background: Warm beige (#FAF6F1 light), Dark brown (#1A1A1A dark)
- Tag colors: yellow, pink, green, orange, gray

### Spacing & Styling
- Margins: 24-32px from edges
- Border radius: 14-20px with `borderCurve: 'continuous'` for iOS
- Cards use dynamic backgrounds and borders in dark mode
- Bottom tab bar has enhanced styling with blur effect on iOS

## Key Patterns

### Adding a new block action
1. Add action type in `AppContext.js` ACTIONS
2. Add reducer case
3. Add action function with storage persistence
4. Export in context value

### Creating a new screen
1. Create component in `src/screens/`
2. Export from `src/screens/index.js`
3. Add to appropriate stack in `AppNavigator.js`

### Working with notifications
- Never schedule notifications without canceling previous ones first
- Use `cancelAllNotifications()` to clear both scheduled and presented notifications
- Check logs with `console.log` prefix `[NotificationService]` to debug
- Minimum trigger time is 1 second (validated in `scheduleTimerNotification`)

### State persistence
- All AppContext state changes automatically persist via storage functions
- Use `updateSettings()`, `updateBlock()`, etc. - they handle persistence
- Never manually call AsyncStorage unless adding new storage functions

### Custom duration input
The EditBlockScreen duration input uses a special pattern:
- Uses `isEditingCustom` state flag to control when to show `customDurationText`
- Allows empty field while typing
- Validates on blur (when focus is lost)
- Syncs with preset buttons and +5m/+10m buttons

## Common Issues & Solutions

### Notifications appearing immediately
If notifications show when starting a timer (not when completing):
- Check `setNotificationHandler` configuration in NotificationService.js
- Ensure `shouldShowBanner: false` when app is in foreground
- Verify notifications are scheduled with correct seconds (duration * 60)

### Timer not accurate after backgrounding
- Ensure calculations use `startTimestamp` and `totalPausedSeconds`
- Use `timerService.calculateElapsedSeconds()` when resuming
- Never rely on interval counters for elapsed time

### Dark mode styling issues
- Check if component uses `isDark` flag from `useTheme()`
- Cards should have border in dark mode, no border in light mode
- Use `colors.surface` for elevated elements in dark mode
- Tab bar should use blur on iOS with conditional opacity

## Testing Focus
Tests are in `__tests__/statistics.test.js` and cover:
- Date/time utilities (`formatDuration`, `formatTime`, `getWeekDays`)
- Statistics calculations (`calculateGoalProgress`, `calculateStreak`)
- Session aggregation (`calculateTotalFocusTime`, `calculateSessionCount`)
- Validation helpers (`validateBlockTitle`, `validateDuration`)
