# AGENTS.md - FocusBlocks Development Guide

## Commands

```bash
# Development
npm start              # Start Expo dev server
npm run ios            # Start with iOS Simulator
npm run android        # Start with Android Emulator
npm run web            # Start web build

# Testing
npm test               # Run all tests
npm run test:watch     # Run tests in watch mode
npm test <file>        # Run single test file
npm test -- -t "<name>" # Run single test by name
```

## Architecture

### Directory Structure
```
src/
├── components/     # Reusable UI components (Button, Card, Input, etc.)
├── contexts/       # React Context providers (AppContext, ThemeContext)
├── models/         # Data model factories (createBlock, createProject, etc.)
├── navigation/     # React Navigation setup (AppNavigator)
├── screens/        # Screen components (TimerScreen, ProjectsScreen, etc.)
├── services/       # Background services (TimerService, NotificationService, SoundService)
├── storage/        # AsyncStorage persistence layer
├── theme/          # Design system (colors, spacing, typography)
└── utils/          # Helper functions (statistics, validation)
```

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.

### State Management
- React Context + useReducer pattern in `src/contexts/`
- All state persisted to AsyncStorage via `src/storage/index.js`
- Use `useApp()` hook to access AppContext

## Code Style Guidelines

### Imports
- Group imports: React, third-party, internal modules
- Use relative imports: `import { useTheme } from '../contexts/ThemeContext'`
- Use named exports for components: `export default function BlockCard(...)`

### Components
- Use functional components with hooks
- Default props for optional parameters: `showPlayButton = true`
- Destructure props in function signature
- Keep components focused (< 200 lines ideally)

### Naming Conventions
- Components: PascalCase (`BlockCard`, `TimerScreen`)
- Hooks: camelCase with "use" prefix (`useApp`, `useTheme`)
- Constants: SCREAMING_SNAKE_CASE for config values
- Variables/functions: camelCase (`addBlock`, `isRunning`)
- File names: PascalCase for components, camelCase for utilities

### React Patterns
- Use `useCallback` for functions passed as props
- Use `useEffect` for side effects with cleanup
- Use `StyleSheet.create` for RN styles (not inline objects)
- Prefer `TouchableOpacity` for pressable elements

### Error Handling
- Wrap async operations in try/catch blocks
- Log errors with context: `console.error('Error loading data:', error)`
- Return null/false on storage failures, don't throw
- Use helper functions for data normalization (`normalizeBoolean`, `normalizeNumber`)

### Data Models (src/models/index.js)
- Create using factory functions: `createBlock(data)`, `createProject(data)`
- All models have `id` property (generated with uuid)
- Timestamps use ISO 8601 format (`new Date().toISOString()`)

### Actions Pattern (AppContext.js)
1. Define action type constant in ACTIONS object
2. Add reducer case in `appReducer` function
3. Create async action function with `useCallback`
4. Persist to storage before dispatching
5. Export in context value object

### Testing
- Jest for unit tests in `__tests__/` directory
- Use `describe()` for test suites, `test()` for cases
- Test utilities in `src/utils/statistics.js`
- Mock external dependencies in jest.setup.js

### Design System
- Primary color: Coral (#D9704A light, #E5A63D dark)
- Background: Beige (#F5F1ED light), Dark (#1A1A1A dark)
- Spacing: 24-32px margins, 12-16px gaps
- Border radius: 16-20px cards, 8-12px buttons

## MCP Tools

### Context7
When searching for documentation (React Native, Expo, React, etc.), use the `context7` MCP tool.
