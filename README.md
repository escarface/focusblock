# FocusBlocks

A focus time management app built with React Native and Expo. Track your productivity with customizable focus blocks, projects, and detailed statistics.

## Features

### Core Features
- **Focus Timer**: Circular progress timer with pause/resume/reset/skip controls
- **Focus Blocks**: Create customizable time blocks with durations, categories, and colors
- **Projects**: Organize blocks into projects for better task management
- **Statistics**: Track daily/weekly focus time, session counts, and streaks
- **Daily Goals**: Set and track progress toward daily focus goals
- **Dark Mode**: Full light/dark theme support

### Timer Features
- Real-time circular progress visualization
- Background time tracking (uses timestamps for accuracy)
- Automatic session logging (start, pause, resume, finish, skip events)
- Auto-start next block option
- Sound alerts and notifications

### Block Management
- CRUD operations for focus blocks
- Duration presets (15, 25, 30 min) + custom duration
- Category tags (Work, Admin, Personal, Strategy, Learning, Creative)
- Color coding system
- Notes field for additional context
- Reordering blocks in queue

### Statistics & History
- Calendar view with day selection
- Total focus time per day
- Session count tracking
- Daily goal progress percentage
- Streak tracking (consecutive days with sessions)
- Completed blocks history

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation v6 (Native Stack + Bottom Tabs)
- **State Management**: React Context + useReducer
- **Persistence**: AsyncStorage
- **Notifications**: expo-notifications
- **UI**: Custom components with SVG icons (react-native-svg)
- **Animations**: React Native Animated API

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── BlockCard.js     # Focus block card component
│   ├── Button.js        # Custom button component
│   ├── Card.js          # Base card container
│   ├── CircularProgress.js  # Timer ring component
│   ├── ConfirmDialog.js # Confirmation modal
│   ├── EmptyState.js    # Empty state placeholder
│   ├── Header.js        # Screen header component
│   ├── Icons.js         # SVG icon components
│   ├── Input.js         # Text input component
│   └── Toggle.js        # Toggle switch component
│
├── contexts/            # React Context providers
│   ├── AppContext.js    # Global app state (blocks, projects, sessions)
│   └── ThemeContext.js  # Theme state (dark/light mode)
│
├── hooks/               # Custom React hooks
│
├── models/              # Data models and factories
│   └── index.js         # createUser, createProject, createBlock, createSession
│
├── navigation/          # Navigation configuration
│   └── AppNavigator.js  # Root navigator with auth flow and tabs
│
├── screens/             # Screen components
│   ├── SplashScreen.js      # App launch screen
│   ├── LoginScreen.js       # Authentication screen
│   ├── TimerScreen.js       # Main timer/today view
│   ├── EditBlockScreen.js   # Create/edit block modal
│   ├── BlockDetailScreen.js # Block details and history
│   ├── ProjectsScreen.js    # Projects list
│   ├── ProjectDetailScreen.js # Project blocks list
│   ├── HistoryScreen.js     # Statistics and history
│   ├── SettingsScreen.js    # App settings
│   └── EditProfileScreen.js # Profile editing
│
├── services/            # Business logic services
│   ├── TimerService.js      # Timer management with background support
│   ├── NotificationService.js # Local notifications
│   └── SoundService.js      # Audio alerts
│
├── storage/             # Data persistence
│   └── index.js         # AsyncStorage CRUD operations
│
├── theme/               # Design system
│   ├── colors.js        # Color palettes (light/dark)
│   ├── typography.js    # Font styles
│   ├── spacing.js       # Spacing and shadows
│   └── index.js         # Theme exports and constants
│
└── utils/               # Utility functions
    ├── statistics.js    # Statistics calculations
    └── index.js         # Validation and helpers
```

## Installation

### Prerequisites
- Node.js 18 or later
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd focusblocks
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
# or
expo start
```

4. Run on your device:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app

## Usage Guide

### Getting Started
1. Launch the app to see the splash screen
2. Enter your email on the login screen (local authentication)
3. You'll be taken to the Timer screen

### Creating a Focus Block
1. Tap the `+` button on the Timer screen
2. Enter what you're working on
3. Select duration (preset or custom)
4. Choose a tag color and category
5. Add optional notes
6. Tap "Save Block"

### Starting a Focus Session
1. Tap the play button on a block card, or
2. Tap the main play button to start the first block
3. Use pause/resume during your session
4. Block auto-completes when timer reaches zero

### Managing Projects
1. Navigate to the Tasks tab
2. Tap `+` to create a new project
3. Open a project to view its blocks
4. Create blocks within projects for organization

### Viewing Statistics
1. Go to the History tab
2. Select a day from the calendar
3. View total focus time and session count
4. See completed blocks for that day

### Customizing Settings
1. Go to Settings tab
2. Toggle sound alerts, notifications, dark mode
3. Set your daily focus goal
4. Edit your profile information

## Technical Decisions

### Persistence: AsyncStorage
We chose AsyncStorage for its simplicity and reliability for this use case:
- Simple key-value storage perfect for JSON data
- No complex queries needed
- Works offline by default
- Easy to scale to SQLite later if needed

### Timer Background Handling
The timer uses timestamps rather than intervals for accuracy:
- Records `startTimestamp` when timer starts
- Calculates elapsed time on each tick
- Recalculates when app returns from background
- Stores `totalPausedSeconds` to account for pauses

### State Management
React Context with useReducer pattern:
- Clean separation of concerns
- Predictable state updates
- Easy to debug and test
- No external dependencies

### Local Notifications
expo-notifications for cross-platform support:
- Schedule notification when timer starts
- Cancel/reschedule on pause/resume
- Handles Android channels automatically

## Running Tests

```bash
npm test
```

Tests cover:
- Statistics calculation utilities
- Duration and time formatting
- Goal progress calculations
- Streak calculations
- Input validation helpers

## Building for Production

### iOS
```bash
expo build:ios
# or with EAS
eas build --platform ios
```

### Android
```bash
expo build:android
# or with EAS
eas build --platform android
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License - feel free to use this project for learning or as a base for your own apps.
