# FocusBlocks UI Modernization - Technical Specification

**Version**: 1.0
**Date**: 2026-01-18
**Author**: Claude Code
**Status**: Ready for Implementation

---

## Executive Summary

Transform FocusBlocks into a distinctive, premium Pomodoro timer app through comprehensive UI/UX modernization. This spec covers migration to Expo Router, implementation of iOS-native patterns, smooth animations, haptic feedback, and performance optimization.

**Timeline**: 3-4 weeks
**Platform Priority**: iOS-first (Android graceful fallbacks)
**Scope**: Full modernization (Foundation → Hero Screens → Native Patterns → Performance)

---

## 1. Project Overview

### 1.1 Current State
- **Framework**: React Native 0.81.5 + Expo 54
- **Navigation**: React Navigation v7 (bottom tabs + stacks)
- **State**: React Context + useReducer + AsyncStorage
- **Theme**: Warm earthy palette, dark mode support
- **Animations**: react-native-reanimated 4.1.1 (barely used)
- **Components**: 12 reusable components, 8 screens

### 1.2 Target State
- **Navigation**: Expo Router (file-based, native patterns)
- **Animations**: Comprehensive reanimated usage (60fps)
- **Haptics**: expo-haptics integration throughout
- **Visual Effects**: Gradients, blur, glass-morphism
- **Performance**: FlatList virtualization, skeleton loaders
- **iOS Patterns**: Link.Preview, context menus, native headers

### 1.3 Success Criteria
- All screens have smooth entrance/exit animations (60fps)
- Every interaction has haptic feedback on iOS
- Timer ring has animated gradient stroke with pulse effect
- Navigation uses file-based routing with deep linking
- List scrolling smooth with 100+ items (FlatList)
- Dark mode works across all new components
- App feels premium, distinctive, and focused

---

## 2. Architecture Changes

### 2.1 Navigation Migration: React Navigation → Expo Router

#### Current Structure
```
src/navigation/AppNavigator.js
└── TabNavigator
    ├── TimerStackNavigator → TimerScreen, EditBlock, BlockDetail
    ├── ProjectsStackNavigator → ProjectsScreen, ProjectDetail, EditBlock, BlockDetail
    ├── HistoryStackNavigator → HistoryScreen, BlockDetail
    └── SettingsStackNavigator → SettingsScreen, EditProfile
```

#### Target Structure
```
app/
  _layout.tsx                           # NativeTabs root
  (timer,tasks,history,settings)/
    _layout.tsx                         # Shared Stack navigator
    index.tsx                           # Tab home screen
    edit-block.tsx                      # Shared modal
    block-detail/[id].tsx               # Shared detail (dynamic route)
  settings/edit-profile.tsx             # Settings only
```

#### Migration Steps

**Step 1: Create app directory structure**
```bash
mkdir -p app/{timer,tasks,history,settings}
```

**Step 2: Root layout with NativeTabs**
```typescript
// app/_layout.tsx
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Theme } from '../src/components/theme';

export default function Layout() {
  return (
    <Theme>
      <NativeTabs>
        <NativeTabs.Trigger name="(timer)">
          <Icon sf="timer" />
          <Label>Timer</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(tasks)">
          <Icon sf="list.bullet" />
          <Label>Tasks</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(history)">
          <Icon sf="chart.bar" />
          <Label>History</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="(settings)">
          <Icon sf="gearshape" />
          <Label>Settings</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </Theme>
  );
}
```

**Step 3: Shared stack layout**
```typescript
// app/(timer,tasks,history,settings)/_layout.tsx
import { Stack } from 'expo-router/stack';
import { PlatformColor } from 'react-native';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerBlurEffect: 'systemMaterial',
        headerLargeTitle: true,
        headerLargeTitleShadowVisible: false,
        headerTitleStyle: { color: PlatformColor('label') },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="edit-block"
        options={{
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.5, 1.0],
        }}
      />
      <Stack.Screen
        name="block-detail/[id]"
        options={{ headerLargeTitle: false }}
      />
    </Stack>
  );
}
```

**Step 4: Update navigation calls**
```typescript
// OLD (React Navigation)
navigation.navigate('EditBlock', { block });
navigation.navigate('BlockDetail', { blockId: block.id });

// NEW (Expo Router)
import { router } from 'expo-router';
router.push('/edit-block?blockId=' + block.id);
router.push(`/block-detail/${block.id}`);

// OR with Link component
import { Link } from 'expo-router';
<Link href={`/block-detail/${block.id}`}>View Block</Link>
```

**Step 5: Config changes**
```json
// app.json
{
  "expo": {
    "scheme": "focusblocks",
    "plugins": ["expo-router"]
  }
}
```

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['expo-router/babel'],
  };
};
```

#### Breaking Changes
- All `navigation.navigate()` calls must be updated
- Route params change from navigation params to search params or dynamic routes
- Custom Header component replaced by Stack.Screen options
- Modal presentation handled by route options, not navigator config

#### Rollback Plan
- Keep `src/navigation/AppNavigator.js` in git history
- Tag pre-migration commit as `pre-expo-router`
- If critical issues, revert migration commits and restore React Navigation

---

### 2.2 Component Architecture

#### New Components

**1. AnimatedCircularProgress** (`src/components/AnimatedCircularProgress.js`)
```typescript
interface AnimatedCircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0-1
  children?: React.ReactNode;
  gradientColors?: string[];
  pulseWhenActive?: boolean;
}
```
- Replaces current CircularProgress
- Uses react-native-svg + reanimated
- Gradient stroke via LinearGradient
- Pulse glow effect when active (useSharedValue)
- Smooth progress animation (spring physics)

**2. SwipeableBlockCard** (`src/components/SwipeableBlockCard.js`)
```typescript
interface SwipeableBlockCardProps {
  block: Block;
  isActive: boolean;
  onPress: () => void;
  onPlayPress: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}
```
- Wraps existing BlockCard
- Uses react-native-gesture-handler PanGestureHandler
- Swipe left: reveal delete/edit actions (translateX)
- Long press: iOS context menu (Link.Menu)
- Active glow: border animation

**3. AnimatedStatsCard** (`src/components/AnimatedStatsCard.js`)
```typescript
interface AnimatedStatsCardProps {
  label: string;
  value: number;
  unit?: string;
  icon?: string;
  index?: number; // For stagger delay
}
```
- Count-up animation for value changes
- Staggered entrance (delay = index * 50ms)
- Icon background rotation on mount
- Spring animation for card appearance

**4. GradientBackground** (`src/components/GradientBackground.js`)
```typescript
interface GradientBackgroundProps {
  preset: 'primary' | 'warm' | 'surface' | 'timer';
  style?: ViewStyle;
  children?: React.ReactNode;
}
```
- Uses expo-linear-gradient
- Predefined gradient presets from theme
- Absolute positioning for background use

**5. GlassCard** (`src/components/GlassCard.js`)
```typescript
interface GlassCardProps {
  children: React.ReactNode;
  intensity?: number; // 0-100
  tint?: 'light' | 'dark' | 'default';
  style?: ViewStyle;
}
```
- iOS: expo-blur BlurView
- Android: Semi-transparent background with border
- Border with opacity
- Shadow depth

**6. SkeletonLoader** (`src/components/SkeletonLoader.js`)
```typescript
interface SkeletonLoaderProps {
  type: 'card' | 'stats' | 'circle' | 'text';
  count?: number;
}
```
- Shimmer animation (gradient translateX loop)
- Different layouts per type
- Used during AsyncStorage loading

#### Component Modifications

**Button** (`src/components/Button.js`)
- Add haptic feedback on press (light)
- Add press animation (scale 0.95)
- Add variants: 'pill', 'icon-only'
- Add loading state with spinner

**Toggle** (`src/components/Toggle.js`)
- Add haptic feedback on toggle (medium)
- Enhance spring animation (bounciness: 6)

**BlockCard** (`src/components/BlockCard.js`)
- Integrate SwipeableBlockCard wrapper
- Add context menu support
- Add active glow animation

**Input** (`src/components/Input.js`)
- Add error shake animation
- Add success checkmark animation
- Add focused glow effect (border shadow)

---

## 3. Feature Specifications

### 3.1 Haptic Feedback System

**File**: `src/utils/haptics.js`

```typescript
// Haptic intensity levels
export const haptics = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),
  selection: () => Haptics.selectionAsync(),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
};
```

**Integration Points**:
| Component | Trigger | Intensity |
|-----------|---------|-----------|
| Button (all) | onPress | light |
| BlockCard play | onPress | medium |
| Timer start | onPress | medium |
| Timer pause | onPress | light |
| Timer complete | auto | heavy |
| Timer skip | onPress | medium |
| Toggle | onChange | medium |
| Color picker | onSelect | selection |
| Category picker | onSelect | selection |
| Calendar day | onSelect | selection |
| Save success | onSave | success |
| Delete confirm | onDelete | warning |
| Error validation | onError | error |

**Platform Handling**:
```typescript
export const triggerHaptic = async (type: HapticType) => {
  if (Platform.OS === 'ios') {
    await haptics[type]();
  }
  // Android: gracefully degrades (no action)
};
```

---

### 3.2 Animation System

**File**: `src/utils/animations.js` (expand existing)

**New Animations**:
```typescript
// Press feedback
export const pressScale = withSpring(0.95, { damping: 15, stiffness: 300 });

// Slide transitions
export const slideInRight = SlideInRight.duration(300).springify().damping(15);
export const slideOutLeft = SlideOutLeft.duration(250).springify().damping(20);

// Pulse/glow effect
export const pulseGlow = {
  opacity: withRepeat(
    withSequence(
      withTiming(1, { duration: 1000 }),
      withTiming(0.6, { duration: 1000 })
    ),
    -1,
    true
  )
};

// Shimmer effect
export const shimmer = (width: number) => {
  return withRepeat(
    withTiming(width, { duration: 1500, easing: Easing.linear }),
    -1,
    false
  );
};

// Shake animation
export const shake = withSequence(
  withTiming(-10, { duration: 50 }),
  withTiming(10, { duration: 50 }),
  withTiming(-10, { duration: 50 }),
  withTiming(0, { duration: 50 })
);

// Count-up animation
export const countUp = (from: number, to: number, duration = 800) => {
  return withTiming(to, { duration, easing: Easing.out(Easing.quad) });
};
```

**Application Matrix**:
| Screen | Animation | Elements |
|--------|-----------|----------|
| TimerScreen | fadeIn, pulseGlow, slideInUp | Screen, timer ring, focus badge |
| HistoryScreen | staggered cards, slideInRight | Stats cards, calendar transition |
| EditBlockScreen | modalEntering, shake | Modal entrance, error validation |
| BlockCard | cardEntering, pressScale | Card appearance, button press |
| All lists | listItemEntering | Staggered list items |
| All modals | modalEntering/Exiting | Modal transitions |

---

### 3.3 Gradient System

**File**: `src/theme/gradients.js`

```typescript
export const gradients = {
  // Timer ring gradient (coral → gold)
  timerGradient: {
    colors: ['#D4714A', '#E5A63D'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },

  // Primary button gradient
  primaryGradient: {
    colors: ['#D4714A', '#B85A3A'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },

  // Warm background gradient (very subtle)
  warmGradient: {
    colors: ['#FAF6F1', '#F5EFE7'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },

  // Surface card gradient (dark mode)
  surfaceGradient: (isDark: boolean) => ({
    colors: isDark ? ['#2E2820', '#252018'] : ['#FFFFFF', '#FAFAFA'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  }),

  // Shimmer effect gradient
  shimmerGradient: {
    colors: ['transparent', 'rgba(255, 255, 255, 0.3)', 'transparent'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
};
```

**Usage Examples**:
```typescript
// Timer ring stroke
<AnimatedCircularProgress gradientColors={gradients.timerGradient.colors} />

// Button background
<GradientBackground preset="primary">
  <Button>Start Timer</Button>
</GradientBackground>

// Tab bar background
<LinearGradient
  colors={gradients.warmGradient.colors}
  style={styles.tabBar}
/>
```

---

### 3.4 iOS Native Patterns

#### Link Previews

**Implementation**:
```typescript
// BlockCard with preview
<Link href={`/block-detail/${block.id}`}>
  <Link.Trigger>
    <Pressable>
      <BlockCard block={block} />
    </Pressable>
  </Link.Trigger>
  <Link.Preview>
    <BlockDetailPreview blockId={block.id} />
  </Link.Preview>
</Link>
```

**Preview Components to Create**:
- `BlockDetailPreview`: Shows block title, duration, category, recent sessions
- `ProjectPreview`: Shows project stats, block count, completion rate
- `DayPreview`: Shows calendar day summary, total focus time, blocks

#### Context Menus

**Implementation**:
```typescript
<Link href={`/block-detail/${block.id}`} asChild>
  <Link.Trigger>
    <Pressable onLongPress={() => haptics.selection()}>
      <BlockCard block={block} />
    </Pressable>
  </Link.Trigger>
  <Link.Menu>
    <Link.MenuAction
      title="Edit"
      icon="pencil"
      onPress={() => router.push(`/edit-block?blockId=${block.id}`)}
    />
    <Link.MenuAction
      title="Duplicate"
      icon="doc.on.doc"
      onPress={() => handleDuplicate(block)}
    />
    <Link.MenuAction
      title="Delete"
      icon="trash"
      destructive
      onPress={() => handleDelete(block.id)}
    />
  </Link.Menu>
</Link>
```

**Menu Locations**:
| Component | Actions |
|-----------|---------|
| BlockCard | Edit, Duplicate, Delete |
| ProjectCard | Rename, Delete, View Stats |
| Calendar Day | Jump to Date, Add Block |
| Header Settings | Toggle Dark Mode, Export Data |

---

## 4. Screen-by-Screen Specifications

### 4.1 TimerScreen

**File**: `app/(timer)/index.tsx`

#### Visual Enhancements

**Circular Progress**:
- Replace CircularProgress with AnimatedCircularProgress
- Gradient stroke: coral (#D4714A) → gold (#E5A63D)
- Pulse glow when timer running (opacity 1 → 0.6 → 1, 2s loop)
- Smooth progress animation (spring physics)
- Timer text: Animate digit changes (fade out old, fade in new)

**Focus Badge**:
- Breathing pulse animation (scale 1 → 1.05 → 1, 2s loop)
- Dot pulse in sync with badge

**Controls**:
- Play/Pause button:
  - Press: scale 0.95 + haptic medium
  - Icon crossfade transition (300ms)
  - Disabled state: opacity 0.4 + no haptic
- Reset button:
  - Press: 360° rotate + haptic light
  - Disabled: opacity 0.4
- Skip button:
  - Press: slide-out animation + haptic medium
  - Icon moves right 10px and fades out

**Up Next Section**:
- Block cards: Staggered entrance (50ms delay per card)
- Active card: Elevated shadow + glow border animation
- Swipe left on card: Reveal delete/edit actions (translateX)
- Long press: Context menu (Edit, Duplicate, Delete)
- Drag handle hint: Subtle pulse on first render

**FAB (Add Button)**:
- Gradient background (primaryGradient)
- Press: scale 0.9 + rotate 90° + haptic light
- Shadow: 0 4px 12px rgba(212, 113, 74, 0.3)

#### Animations Timeline
```
Screen mount:
  0ms: fadeIn (screen)
  100ms: pulseGlow starts (timer ring if active)
  200ms: fadeIn (focus badge if active)
  300ms: staggered cards (50ms each)

Timer start:
  0ms: haptic medium
  0ms: play icon → pause icon (crossfade 300ms)
  100ms: pulse glow animation starts
  200ms: focus badge scale-in

Timer complete:
  0ms: haptic heavy
  0ms: pulse glow stops
  200ms: completion animation (ring fills + bounce)
  500ms: focus badge fade-out
  800ms: if auto-start next, start new block
```

---

### 4.2 HistoryScreen

**File**: `app/(history)/index.tsx`

#### Visual Enhancements

**Calendar**:
- Week/Month toggle:
  - Animated layout transition (LayoutAnimation)
  - Toggle button: Slide indicator (translateX spring)
- Day selection:
  - Press: scale 0.95 + haptic selection
  - Selected: Border glow animation
  - Today indicator: Subtle pulse (opacity)
- Month navigation:
  - Left arrow: Slide-out left, new month slide-in right
  - Right arrow: Slide-out right, new month slide-in left
  - Animation: 300ms spring
- Completed days:
  - Small dot indicator (4px)
  - Fade-in when data loads

**Stats Cards**:
- Replace with AnimatedStatsCard component
- Staggered entrance: 50ms delay per card
- Number values: Count-up animation on change
  - Duration: 800ms
  - Easing: Ease-out quad
  - Format: Round to 1 decimal if needed
- Icon background:
  - Rotate 360° on mount (500ms)
  - Spring damping: 12
- Progress bar (goal progress):
  - Animated fill (spring)
  - Start: 0% width
  - End: actual % width
  - Duration: 600ms

**Completed Blocks List**:
- Convert to FlatList (virtualization)
- Item entrance: fadeIn + slideInUp (staggered)
- Checkmark: Bounce-in animation (500ms)
- Swipe left: Delete action
- Long press: Context menu (View Details, Delete)

**Empty State**:
- Fade + scale animation (800ms)
- Illustration: Gentle bounce loop

#### Animations Timeline
```
Screen mount:
  0ms: fadeIn (screen)
  100ms: Calendar fade-in
  200ms: Stats cards stagger (50ms each)
    - Card 1: 200ms (Focus Time)
    - Card 2: 250ms (Sessions)
    - Card 3: 300ms (Goal Progress)
    - Card 4: 350ms (Streak)
  600ms: Blocks list stagger (30ms each)

Week ↔ Month toggle:
  0ms: Layout animation config
  0ms: Toggle indicator slide (300ms spring)
  0ms: Calendar morph (300ms spring)

Day selection:
  0ms: haptic selection
  0ms: Previous day scale back to 1 (200ms)
  0ms: New day scale + glow (300ms spring)
  100ms: Stats cards count-up animation (800ms)
```

---

### 4.3 EditBlockScreen

**File**: `app/edit-block.tsx`

#### Modal Presentation
```typescript
// In parent Stack.Screen options
{
  presentation: 'formSheet',
  sheetGrabberVisible: true,
  sheetAllowedDetents: [0.5, 1.0],
  contentStyle: { backgroundColor: 'transparent' }, // iOS 26+ glass effect
}
```

#### Visual Enhancements

**Modal Entrance**:
- Slide-up spring animation (modalEntering)
- Background dim: Fade-in 0 → 0.4 (300ms)
- Handle bar: Subtle pulse hint (once, 2s after mount)

**Title Input**:
- Focus:
  - Border scale: 1px → 2px (200ms)
  - Border color: border → primary
  - Glow: boxShadow 0 0 0 → 0 0 8px primary (300ms)
  - Haptic: light
- Blur:
  - Glow fade-out (200ms)
- Validation error:
  - Shake animation (200ms, 4 shakes)
  - Border color: primary → error
  - Error text: slideInDown (200ms)
  - Haptic: error
- Success:
  - Checkmark icon fade-in next to input (300ms)
  - Haptic: success (on save)

**Duration Selector**:
- Preset buttons:
  - Press: spring scale 1 → 0.95 → 1.05 → 1 (400ms)
  - Selected: Background color morph (300ms)
  - Haptic: selection
- Custom input:
  - Focus: Same as title input
  - +5m/+10m buttons:
    - Press: Bounce animation (300ms)
    - Number: Count-up animation (500ms)
    - Haptic: light
- Duration display:
  - Number change: Fade-out old, fade-in new (200ms)

**Color Picker**:
- Button press:
  - Scale 1 → 1.1 (100ms) → 1 (200ms)
  - Haptic: selection
- Selected indicator:
  - Ring: Fade-in + rotate 180° (300ms spring)
  - Ring color: Matches selected color

**Category Selector**:
- Button press:
  - Morph animation: Width expand (unselected → selected)
  - Background: Color transition (300ms)
  - Icon: Rotate 360° (400ms)
  - Haptic: selection

**Save Button**:
- Press states:
  - Idle: Primary color
  - Loading: Pulse animation + spinner
  - Success: Checkmark morph (button → checkmark circle)
  - Disabled: opacity 0.4 + desaturate
- Haptic:
  - Press: light
  - Success: success
  - Error: error

#### Animations Timeline
```
Modal open:
  0ms: modalEntering (slide-up spring 400ms)
  0ms: Background dim fade-in (300ms)
  200ms: Content fade-in (200ms)
  2000ms: Handle pulse hint (once)

Field interactions:
  Focus:
    0ms: haptic light
    0ms: Border scale (200ms)
    0ms: Glow appear (300ms)

  Validation error:
    0ms: haptic error
    0ms: Shake animation (200ms)
    0ms: Border color change (100ms)
    100ms: Error text slide-in (200ms)

  Save success:
    0ms: haptic success
    0ms: Button → Checkmark morph (400ms)
    400ms: Modal dismiss (300ms)
```

---

### 4.4 BlockCard Enhancements

**File**: `src/components/SwipeableBlockCard.js`

#### Swipe Gestures

**Swipe Left (Delete/Edit)**:
```typescript
const translateX = useSharedValue(0);

const gestureHandler = useAnimatedGestureHandler({
  onActive: (event) => {
    translateX.value = Math.min(0, event.translationX);
  },
  onEnd: (event) => {
    if (event.translationX < -70) {
      // Reveal actions
      translateX.value = withSpring(-140);
    } else {
      // Snap back
      translateX.value = withSpring(0);
    }
  },
});
```

**Actions Revealed**:
- Edit button (70px width, blue background)
- Delete button (70px width, red background)
- Icons: pencil, trash (SF Symbols)

**Swipe Right (Quick Start)**:
- Threshold: 50px
- Action: Start timer immediately
- Visual: Green background fade-in
- Haptic: medium on action trigger

#### Long Press Context Menu
```typescript
<Link.Menu>
  <Link.MenuAction title="Edit" icon="pencil" onPress={handleEdit} />
  <Link.MenuAction title="Duplicate" icon="doc.on.doc" onPress={handleDuplicate} />
  <Link.MenuAction
    title="Delete"
    icon="trash"
    destructive
    onPress={handleDelete}
  />
</Link.Menu>
```

#### Active State Animation
```typescript
const glowOpacity = useSharedValue(0);

useEffect(() => {
  if (isActive) {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  } else {
    glowOpacity.value = withTiming(0);
  }
}, [isActive]);

// Border glow style
const animatedBorderStyle = useAnimatedStyle(() => ({
  borderWidth: 2,
  borderColor: `rgba(212, 113, 74, ${glowOpacity.value})`,
}));
```

---

## 5. Performance Specifications

### 5.1 FlatList Migration

**Screens to Convert**:
1. TimerScreen "Up Next" (currently `.map()`)
2. HistoryScreen "Completed Blocks" (currently `.map()`)
3. ProjectsScreen project list (currently `.map()`)
4. ProjectDetailScreen blocks list (currently `.map()`)

**FlatList Configuration**:
```typescript
<FlatList
  data={blocks}
  renderItem={({ item, index }) => (
    <BlockCard
      block={item}
      entering={listItemEntering(index)}
    />
  )}
  keyExtractor={(item) => item.id}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  contentContainerStyle={{ paddingBottom: 100 }}
  ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
  ListEmptyComponent={<EmptyState />}
/>
```

**Performance Gains**:
- Virtualization: Only render visible items + buffer
- Memory: Constant memory usage regardless of list length
- Scroll: 60fps with 100+ items (vs. 30fps with ScrollView)

---

### 5.2 Skeleton Loading States

**File**: `src/components/SkeletonLoader.js`

**Skeleton Types**:

**1. Card Skeleton**
```typescript
<View style={styles.skeletonCard}>
  <ShimmerEffect width="100%" height={80} borderRadius={16} />
</View>
```

**2. Stats Skeleton**
```typescript
<View style={styles.skeletonStats}>
  {[1, 2, 3, 4].map(i => (
    <ShimmerEffect key={i} width="48%" height={100} borderRadius={16} />
  ))}
</View>
```

**3. Circle Skeleton** (Timer)
```typescript
<ShimmerEffect width={260} height={260} borderRadius={130} />
```

**Shimmer Animation**:
```typescript
const translateX = useSharedValue(-width);

useEffect(() => {
  translateX.value = withRepeat(
    withTiming(width, { duration: 1500, easing: Easing.linear }),
    -1,
    false
  );
}, []);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
}));

return (
  <View style={[styles.skeleton, { width, height, borderRadius }]}>
    <Animated.View style={[styles.shimmer, animatedStyle]}>
      <LinearGradient
        colors={gradients.shimmerGradient.colors}
        start={gradients.shimmerGradient.start}
        end={gradients.shimmerGradient.end}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  </View>
);
```

**Usage Pattern**:
```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  loadData().then(() => setLoading(false));
}, []);

if (loading) {
  return <SkeletonLoader type="card" count={3} />;
}

return <FlatList data={data} ... />;
```

---

### 5.3 Performance Benchmarks

**Target Metrics**:
| Metric | Target | Measurement |
|--------|--------|-------------|
| Screen transition | 60fps | React Native Debugger |
| List scroll (100 items) | 60fps | UI thread FPS monitor |
| Animation smoothness | 60fps | Reanimated FPS overlay |
| App launch | < 2s | Time to interactive |
| Skeleton duration | 1s max | AsyncStorage read time |
| Memory (50+ blocks) | < 200MB | Xcode Instruments |
| Timer tick accuracy | ±100ms | Background resume test |

**Optimization Techniques**:
- FlatList virtualization
- Reanimated worklets (UI thread)
- Memoization (useMemo, React.memo)
- Debounced inputs (search, filters)
- Lazy loading (tab content)
- Image optimization (expo-image)

---

## 6. Design System

### 6.1 Expanded Color Palette

**File**: `src/theme/colors.js`

**Add Interactive States**:
```typescript
// Light mode additions
export const lightColors = {
  // ... existing colors

  // Interactive states
  primaryPressed: '#B85A3A',    // Darker primary
  primaryHover: '#E8956E',      // Lighter primary
  surfacePressed: '#F0F0F0',    // Pressed card

  // Overlays
  overlayLight: 'rgba(0, 0, 0, 0.05)',
  overlayMedium: 'rgba(0, 0, 0, 0.15)',
  overlayHeavy: 'rgba(0, 0, 0, 0.4)',

  // Semantic colors
  successLight: '#E8F5E9',      // Success background
  errorLight: '#FFEBEE',        // Error background
  warningLight: '#FFF9C4',      // Warning background
};

// Dark mode additions
export const darkColors = {
  // ... existing colors

  primaryPressed: '#F5B84F',
  primaryHover: '#D9983A',
  surfacePressed: '#1F1A14',

  overlayLight: 'rgba(255, 255, 255, 0.05)',
  overlayMedium: 'rgba(255, 255, 255, 0.15)',
  overlayHeavy: 'rgba(255, 255, 255, 0.6)',

  successLight: '#1B5E20',
  errorLight: '#B71C1C',
  warningLight: '#F57F17',
};
```

---

### 6.2 Typography Scale

**File**: `src/theme/typography.js`

**Expanded Scale**:
```typescript
export const typography = {
  // ... existing

  sizes: {
    display: 32,      // Hero titles
    title1: 28,       // Page titles
    title2: 22,       // Section titles
    title3: 20,       // Subsection titles
    headline: 17,     // Emphasized body
    body: 16,         // Standard body
    callout: 15,      // De-emphasized body
    subhead: 14,      // Tertiary text
    footnote: 13,     // Captions
    caption1: 12,     // Small labels
    caption2: 11,     // Tiny labels
  },

  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```

**Audit Plan**:
1. Find all hardcoded fontSize values: `grep -r "fontSize: \d" src/`
2. Replace with typography.sizes references
3. Standardize lineHeight values
4. Update fontWeight to use typography.weights

---

### 6.3 Spacing Standardization

**File**: `src/theme/spacing.js`

**Current Scale** (keep):
```typescript
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};
```

**Audit Plan**:
1. Find hardcoded values: `grep -r "margin.*: \d\|padding.*: \d" src/`
2. Replace with spacing tokens
3. Document exceptions (e.g., 2px border, 44px touch target)
4. Add semantic spacing:
```typescript
export const spacing = {
  // ... existing

  // Semantic
  screenPadding: 20,
  cardPadding: 16,
  buttonPadding: 14,
  iconSize: { small: 20, medium: 24, large: 32 },
  touchTarget: 44,
};
```

---

## 7. Testing Strategy

### 7.1 Unit Tests

**New Test Files**:
```
__tests__/
  components/
    AnimatedCircularProgress.test.js
    SwipeableBlockCard.test.js
    AnimatedStatsCard.test.js
    GlassCard.test.js
    SkeletonLoader.test.js
  utils/
    haptics.test.js
    animations.test.js
  theme/
    gradients.test.js
```

**Test Coverage Requirements**:
- Component rendering: 100%
- Animation triggers: 80%
- Haptic calls: 100% (mocked)
- Gradient presets: 100%

**Example Test**:
```typescript
describe('AnimatedCircularProgress', () => {
  it('renders with gradient stroke', () => {
    const { getByTestId } = render(
      <AnimatedCircularProgress
        size={260}
        strokeWidth={14}
        progress={0.5}
        gradientColors={['#D4714A', '#E5A63D']}
      />
    );
    expect(getByTestId('gradient-stroke')).toBeTruthy();
  });

  it('animates progress change', () => {
    const { rerender } = render(
      <AnimatedCircularProgress progress={0.3} />
    );
    rerender(<AnimatedCircularProgress progress={0.7} />);
    // Assert animation triggered
  });
});
```

---

### 7.2 Integration Tests

**Expo Router Migration**:
```typescript
describe('Navigation', () => {
  it('navigates from timer to block detail', () => {
    const { getByText } = render(<App />);
    fireEvent.press(getByText('Block 1'));
    expect(router.pathname).toBe('/block-detail/1');
  });

  it('opens edit modal with sheet presentation', () => {
    const { getByTestId } = render(<App />);
    fireEvent.press(getByTestId('add-button'));
    expect(router.pathname).toBe('/edit-block');
    // Assert sheet presentation
  });
});
```

**Haptic Feedback**:
```typescript
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

describe('Haptic Integration', () => {
  it('triggers haptic on button press', () => {
    const { getByText } = render(<Button>Press Me</Button>);
    fireEvent.press(getByText('Press Me'));
    expect(Haptics.impactAsync).toHaveBeenCalledWith('Light');
  });
});
```

---

### 7.3 E2E Testing

**Test Scenarios**:

**1. Timer Flow**
```
1. Open app → Timer screen appears
2. Tap FAB → Edit modal opens (sheet presentation)
3. Enter block details → Save
4. Block appears in "Up Next"
5. Swipe left on block → Delete action revealed
6. Tap play → Timer starts (gradient ring, pulse glow)
7. Tap pause → Timer pauses (haptic feedback)
8. Tap resume → Timer resumes
9. Wait for completion → Haptic heavy, completion animation
10. Auto-start next block (if enabled)
```

**2. History Flow**
```
1. Navigate to History tab
2. Stats cards appear (staggered animation)
3. Tap week toggle → Month view (animated transition)
4. Swipe calendar left → Previous month (slide animation)
5. Tap completed day → Highlight with glow
6. Stats update (count-up animation)
7. Scroll blocks list → FlatList virtualization
```

**3. Dark Mode**
```
1. Open Settings
2. Toggle dark mode
3. Verify all screens:
   - TimerScreen: Colors, gradients, blur
   - HistoryScreen: Stats cards, calendar
   - EditBlockScreen: Form inputs, modal background
   - BlockCard: Borders, active glow
4. Toggle back to light mode
5. Verify all screens again
```

---

## 8. Deployment Checklist

### 8.1 Pre-Migration
- [x] Tag current commit: `git tag pre-expo-router`
- [ ] Backup AsyncStorage data pattern
- [ ] Document all navigation paths
- [ ] List all route params usage

### 8.2 Migration Phase
- [ ] Install expo-router dependencies
- [ ] Create app/ directory structure
- [ ] Migrate screens to routes
- [ ] Update all navigation calls
- [ ] Test deep linking
- [ ] Update tests for new routing

### 8.3 Feature Implementation
- [ ] Tier 1: Haptics + Animations + Gradients
- [ ] Tier 2: Hero screens (Timer, History, EditBlock)
- [ ] Tier 3: Native patterns (previews, menus, headers)
- [ ] Tier 4: Performance (FlatList, skeletons, gestures)

### 8.4 QA & Testing
- [ ] Unit tests passing (all new components)
- [ ] Integration tests passing (navigation, haptics)
- [ ] E2E tests passing (timer flow, history, dark mode)
- [ ] Performance benchmarks met (60fps animations, < 2s launch)
- [ ] Cross-platform testing (iOS primary, Android fallbacks)

### 8.5 Production Release
- [ ] Version bump: 1.0.0 → 2.0.0
- [ ] Update CHANGELOG.md
- [ ] Update README.md (new architecture)
- [ ] App Store screenshots (showcase new UI)
- [ ] Release notes highlighting UI improvements

---

## 9. Rollback Plan

### 9.1 Critical Issues Trigger Rollback
- Navigation completely broken (can't access screens)
- Animations cause app crashes
- Performance degradation > 30% (FPS drops)
- AsyncStorage data loss

### 9.2 Rollback Steps
```bash
# 1. Revert to pre-migration tag
git checkout pre-expo-router

# 2. Create rollback branch
git checkout -b rollback-expo-router

# 3. Cherry-pick non-navigation improvements (if any)
git cherry-pick <commit-hash> # Gradients
git cherry-pick <commit-hash> # Haptics

# 4. Deploy rollback version
npm run build:ios
npm run build:android

# 5. Document issues for future migration attempt
```

### 9.3 Partial Rollback
If only specific features broken:
- Keep Expo Router migration
- Disable problematic animations (remove entering/exiting props)
- Disable haptics (wrap in feature flag)
- Revert FlatList to ScrollView for specific screen

---

## 10. Future Enhancements (Out of Scope)

**Phase 2 Candidates**:
1. **Dynamic Island Integration** (iOS 16.1+)
   - Show active timer in Dynamic Island
   - Tap to expand timer controls
   - Live progress bar

2. **Live Activities** (iOS 16+)
   - Lock screen timer widget
   - Real-time countdown
   - Quick actions (pause, skip)

3. **Shared Element Transitions**
   - BlockCard → BlockDetail hero animation
   - Project → ProjectDetail transition
   - Smooth cross-screen animations

4. **Advanced Gestures**
   - Drag-to-reorder blocks (inline, not modal)
   - Pinch-to-zoom calendar
   - Swipe between tabs

5. **Micro-animations**
   - Confetti on goal achievement
   - Progress bar fill animation
   - Number increment effects

6. **3D Effects** (react-native-reanimated 3D)
   - Card parallax on scroll
   - Depth layers in modals
   - Perspective transforms

---

## 11. Dependencies

### 11.1 Already Installed ✅
```json
{
  "react-native-reanimated": "~4.1.1",
  "expo-haptics": "^15.0.8",
  "expo-linear-gradient": "^15.0.8",
  "react-native-gesture-handler": "~2.28.0",
  "expo-blur": "~15.0.8",
  "expo-symbols": "~1.0.8"
}
```

### 11.2 To Install
```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

**Version Compatibility**:
- expo-router: ^4.0.0 (Expo 54 compatible)
- react-native-safe-area-context: ^5.6.2
- react-native-screens: ~4.16.0

---

## 12. Timeline & Milestones

### Week 1: Migration + Foundation
**Days 1-3**: Expo Router migration
- Create app/ structure
- Migrate all screens
- Update navigation calls
- Test deep linking

**Days 4-5**: Migration testing
- Fix broken routes
- Verify all flows work
- Update tests

**Days 6-7**: Tier 1 Foundation
- Haptic system
- Animation activation
- Gradient system
- Micro-interactions

**Milestone**: Navigation migrated, haptics working, gradients visible

---

### Week 2: Hero Screens
**Days 1-2**: TimerScreen
- AnimatedCircularProgress component
- Timer controls animations
- Up Next staggered cards
- FAB gradient

**Days 2-3**: HistoryScreen
- AnimatedStatsCard component
- Calendar transitions
- Count-up animations
- FlatList migration

**Days 4-5**: EditBlockScreen
- Form animations
- Validation feedback
- Sheet presentation
- Input focus effects

**Days 6-7**: BlockCard + Projects
- SwipeableBlockCard
- Context menus
- Project screens polish

**Milestone**: Core user flows visually stunning, animations smooth

---

### Week 3: Native Patterns + Polish
**Days 1-2**: iOS native patterns
- Link.Preview implementation
- Context menus everywhere
- Native headers

**Days 3-4**: Design system audit
- Spacing standardization
- Typography audit
- Color states
- Component variants

**Days 5-7**: Performance
- Remaining FlatList migrations
- Skeleton loaders
- Gesture enhancements
- Memory optimization

**Milestone**: Production-ready, performant, iOS-native feel

---

### Week 4: Final Polish + QA
**Days 1-2**: Bug fixes
- Fix animation glitches
- Haptic consistency
- Dark mode issues

**Days 3-4**: Testing
- E2E test coverage
- Performance benchmarks
- Cross-platform testing

**Days 5-7**: Release prep
- Documentation updates
- App Store assets
- Release notes
- Deploy

**Milestone**: v2.0.0 released with distinctive, premium UI

---

## 13. Success Metrics

### Quantitative
- [ ] All animations render at 60fps
- [ ] App launch time < 2s
- [ ] List scroll smooth with 100+ items
- [ ] Memory usage < 200MB with 50+ blocks
- [ ] Test coverage > 80%
- [ ] Zero navigation crashes
- [ ] Zero AsyncStorage data loss

### Qualitative
- [ ] UI feels distinctive vs. competitors
- [ ] Interactions feel responsive and tactile
- [ ] Dark mode looks premium
- [ ] Timer experience is delightful
- [ ] Forms feel smooth and validated
- [ ] Calendar interactions are intuitive
- [ ] App feels "iOS-native"

### User Feedback (Post-Launch)
- App feels faster/smoother
- Timer animation is satisfying
- Haptic feedback enhances experience
- Dark mode is beautiful
- Swipe gestures are discoverable
- Context menus are useful

---

## 14. Contact & References

**Plan Author**: Claude Code
**Date**: 2026-01-18
**Version**: 1.0

**Key Documentation**:
- Expo Router: https://docs.expo.dev/router/introduction/
- Reanimated: https://docs.swmansion.com/react-native-reanimated/
- Expo Haptics: https://docs.expo.dev/versions/latest/sdk/haptics/
- iOS HIG: https://developer.apple.com/design/human-interface-guidelines/

**Implementation Reference**:
- Plan file: `/Users/maitellerenasobrino/.claude/plans/synthetic-hopping-petal.md`
- This spec: `/Users/maitellerenasobrino/Documents/Development/Practicas/Practicas2/UI_MODERNIZATION_SPEC.md`

---

**END OF SPECIFICATION**
