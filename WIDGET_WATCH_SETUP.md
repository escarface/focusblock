# iOS Widget + Apple Watch Setup Guide

This guide details the **manual Xcode steps** required to complete the iOS Widget and Apple Watch integration.

## Overview

All Swift files and React Native code have been created. The remaining work involves:
1. Creating extension targets in Xcode
2. Adding files to targets
3. Configuring capabilities and build settings
4. Testing on simulators/devices

---

## Prerequisites

- Xcode 15+ installed
- iOS 17+ SDK
- watchOS 10+ SDK
- Paired Apple Watch simulator (or physical device)

---

## Part 1: iOS Widget Extension Setup

### Step 1: Create Widget Extension Target

1. Open `ios/Practicas2.xcworkspace` in Xcode
2. Select the Practicas2 project in the navigator
3. Click **+** button at the bottom of targets list
4. Choose **Widget Extension**
   - **Product Name**: `FocusBlocksWidget`
   - **Bundle Identifier**: `com.focusblocks.app.widget`
   - **Include Configuration Intent**: ❌ NO
   - **Project**: Practicas2
   - **Embed in Application**: Practicas2
5. Click **Finish**
6. When prompted "Activate 'FocusBlocksWidget' scheme?", click **Activate**

### Step 2: Add Files to Widget Target

1. In Project Navigator, locate `ios/FocusBlocksWidget/` folder
2. Select **FocusBlocksWidget.swift** file
3. In File Inspector (right panel), under **Target Membership**:
   - ✅ Check `FocusBlocksWidget`
   - ❌ Uncheck `Practicas2`
4. Repeat for:
   - `Info.plist` (should auto-assign)
   - `Assets.xcassets` (should auto-assign)

5. Locate `ios/Shared/SharedDataManager.swift`
6. In Target Membership:
   - ✅ Check `FocusBlocksWidget`
   - ✅ Check `Practicas2` (keep both)

### Step 3: Configure Widget Capabilities

1. Select **FocusBlocksWidget** target
2. Go to **Signing & Capabilities** tab
3. Click **+ Capability**
4. Add **App Groups**
5. Under App Groups section:
   - Click **+** button
   - Enter: `group.com.focusblocks.app`
   - Click **OK**

### Step 4: Configure Widget Build Settings

1. Select **FocusBlocksWidget** target
2. Go to **Build Settings** tab
3. Search for "Deployment Target"
4. Set **iOS Deployment Target**: 17.0 (or match main app)

### Step 5: Delete Xcode-Generated Files

Xcode created default files that conflict with our implementation:

1. In Project Navigator, locate `FocusBlocksWidget/` group
2. **Delete** the following files (Move to Trash):
   - `FocusBlocksWidget.swift` (Xcode's default - we have our own)
   - `FocusBlocksWidgetBundle.swift` (if exists)
   - `FocusBlocksWidgetLiveActivity.swift` (if exists)

3. **Re-add** our custom widget file:
   - Right-click `FocusBlocksWidget` group
   - **Add Files to "Practicas2"...**
   - Navigate to `ios/FocusBlocksWidget/FocusBlocksWidget.swift`
   - **Options**:
     - ✅ Copy items if needed: NO (already in folder)
     - **Add to targets**: ✅ FocusBlocksWidget only
   - Click **Add**

---

## Part 2: Apple Watch App Extension Setup

### Step 1: Create Watch App Target

1. In Xcode, select Practicas2 project
2. Click **+** button at the bottom of targets list
3. Choose **Watch App**
   - **Product Name**: `FocusBlocksWatch`
   - **Bundle Identifier**: `com.focusblocks.app.watchkitapp`
   - **Organization Identifier**: (auto-filled)
   - **Include Notification Scene**: ❌ NO
   - **Include Complication**: ✅ YES
4. Click **Finish**
5. When prompted "Activate 'FocusBlocksWatch' scheme?", click **Activate**

### Step 2: Add Files to Watch App Target

1. Delete Xcode-generated files in `FocusBlocksWatch Watch App` group:
   - `ContentView.swift` (Xcode's default)
   - `FocusBlocksWatchApp.swift` (Xcode's default, if different from ours)
   - Any other generated files

2. Add our custom Watch app files:
   - Right-click `FocusBlocksWatch Watch App` group
   - **Add Files to "Practicas2"...**
   - Navigate to `ios/FocusBlocksWatch Watch App/`
   - **Select** (Cmd+Click to multi-select):
     - `FocusBlocksWatchApp.swift`
     - `ContentView.swift`
     - `ComplicationController.swift`
   - **Options**:
     - ✅ Copy items if needed: NO
     - **Add to targets**: ✅ FocusBlocksWatch Watch App only
   - Click **Add**

3. Add shared files to Watch target:
   - Locate `ios/Shared/SharedDataManager.swift`
   - In File Inspector, under **Target Membership**:
     - ✅ Check `FocusBlocksWatch Watch App`
     - (Keep existing checkmarks for other targets)

### Step 3: Configure Watch App Capabilities

Watch apps do NOT need App Groups (they use Watch Connectivity instead).

1. Select **FocusBlocksWatch Watch App** target
2. Go to **Signing & Capabilities** tab
3. Verify **Automatically manage signing** is enabled
4. Select your **Team**

### Step 4: Configure Watch App Build Settings

1. Select **FocusBlocksWatch Watch App** target
2. Go to **Build Settings** tab
3. Set **watchOS Deployment Target**: 10.0

---

## Part 3: Main App Configuration

### Step 1: Add New Swift Files to Main Target

1. Locate the following files in Project Navigator:
   - `ios/Practicas2/SharedDataBridge.swift`
   - `ios/Practicas2/SharedDataBridge.m`
   - `ios/Practicas2/WatchConnectivityManager.swift`
   - `ios/Practicas2/WatchCommandBridge.swift`
   - `ios/Practicas2/WatchCommandBridge.m`

2. For each file, verify in **File Inspector** > **Target Membership**:
   - ✅ Check `Practicas2` (main app)
   - ❌ Uncheck widget/watch targets

### Step 2: Update Bridging Header

1. Open `ios/Practicas2/Practicas2-Bridging-Header.h`
2. Verify it contains (if not, add):
   ```objc
   #import <React/RCTBridgeModule.h>
   #import <React/RCTEventEmitter.h>
   ```

### Step 3: Configure Main App Capabilities

The main app already has App Groups configured via `app.json`. Verify in Xcode:

1. Select **Practicas2** target
2. Go to **Signing & Capabilities** tab
3. Verify **App Groups** capability exists with:
   - ✅ `group.com.focusblocks.app`

### Step 4: Re-run Expo Prebuild

This ensures entitlements are properly applied:

```bash
cd /Users/maitellerenasobrino/Documents/Development/Practicas/Practicas2
npx expo prebuild --platform ios --clean
```

**Important**: After prebuild, you'll need to **re-add** the widget and watch targets (Steps 1 and 2 above), as prebuild regenerates the Xcode project.

---

## Part 4: Build and Test

### Testing the Widget

1. In Xcode, select **FocusBlocksWidget** scheme (top-left)
2. Choose **iPhone 15 Pro** simulator (or your device)
3. Click **Run** (▶️)
4. Xcode will build and launch the widget preview
5. Long-press home screen > **Add Widget** > FocusBlocks > Timer
6. Start a timer in the main app
7. Widget should update every 5 seconds with live progress

**Expected Behavior:**
- Widget shows circular progress ring
- Time remaining counts down
- Paused state displays "Paused" text
- Empty state shows when no timer active

### Testing the Apple Watch App

1. **Pair Watch Simulator**:
   - Open **Xcode** > **Window** > **Devices and Simulators**
   - Select **Simulators** tab
   - Right-click on iPhone simulator > **Create Watch...**
   - Select Apple Watch Series 9 (or latest)
   - Click **Create**

2. **Run Watch App**:
   - Select **FocusBlocksWatch Watch App** scheme
   - Choose **iPhone 15 Pro + Apple Watch Series 9** paired simulator
   - Click **Run** (▶️)
   - Wait for both simulators to boot

3. **Test Watch Controls**:
   - Start timer in iPhone app
   - Watch should display timer with ring progress
   - Tap **Pause** on watch → iPhone timer pauses
   - Tap **Play** on watch → iPhone timer resumes
   - Tap **Skip** on watch → iPhone skips to next block

**Expected Behavior:**
- Watch displays live timer updates
- Controls on watch affect iPhone app state
- Empty state shows "No active timer" when stopped

### Testing Watch Complications

1. On Watch simulator, **Force Touch** (Cmd+Shift+2) the watch face
2. Tap **Customize**
3. Swipe to **Complications** screen
4. Tap a complication slot
5. Scroll to **FocusBlocks Timer**
6. Select desired complication style (Circular, Corner, etc.)
7. Press **Digital Crown** to save

8. Start a timer in iPhone app
9. Complication should update with live countdown

**Expected Behavior:**
- Complication shows time remaining
- Progress ring fills as timer progresses
- Updates based on application context from iPhone

---

## Part 5: Production Build

### Build for TestFlight

1. Select **Practicas2** scheme
2. Select **Any iOS Device (arm64)**
3. **Product** > **Archive**
4. When archive completes, Xcode Organizer opens
5. Click **Distribute App**
6. Choose **TestFlight & App Store**
7. Follow prompts to upload

**Important**: The widget and watch app extensions are **automatically included** in the archive. No separate upload needed.

### Verify Extensions in TestFlight

After upload completes:
1. Go to App Store Connect
2. Navigate to your app > TestFlight
3. Under **Build**, expand the uploaded build
4. Verify it shows:
   - `FocusBlocks.app` (main app)
   - `FocusBlocksWidget.appex` (widget)
   - `FocusBlocksWatch.watchkitapp` (watch app)

---

## Troubleshooting

### Expo Go Error: Worklets Mismatch (0.7.x vs 0.5.x)

**Symptom**: Metro logs show `WorkletsError: Mismatch between JavaScript part and native part of Worklets`.

**Cause**: Expo Go (native) and JS dependencies are out of sync. In this repo, Expo Go SDK 54 expects Worklets 0.5.x.

**Solution**:
1. Reinstall Expo Go in the simulator (delete app, then open from `npx expo start -c`).
2. Keep JS in sync by pinning Worklets to 0.5.1:
   - `package.json` includes `"overrides": { "react-native-worklets": "0.5.1" }`
   - Run `npm install` after any dependency updates.

### Widget Not Updating

**Symptom**: Widget shows "No timer" even when timer is running

**Solutions**:
1. Check logs in Xcode console for `[SharedDataBridge]` messages
2. Verify App Groups capability is enabled on both main app and widget targets
3. Verify `group.com.focusblocks.app` identifier matches exactly
4. Check that SharedDataManager.swift is added to widget target
5. Force reload widget timeline: Stop app, clear widget from home screen, re-add

### Watch Not Receiving Commands

**Symptom**: Watch shows timer, but controls don't affect iPhone app

**Solutions**:
1. Check logs for `[WatchConnectivity]` and `[WatchCommandBridge]` messages
2. Verify WatchConnectivityManager is initialized in AppDelegate
3. Verify iPhone simulator is "reachable" from watch (check Xcode console)
4. Restart both simulators
5. Check that WatchCommandBridge.swift is added to main app target only

### Build Errors: "No such module 'WidgetKit'"

**Solution**:
1. Select **FocusBlocksWidget** target
2. **Build Phases** > **Link Binary With Libraries**
3. Add `WidgetKit.framework`
4. Add `SwiftUI.framework`

### Build Errors: "No such module 'WatchConnectivity'"

**Solution**:
1. Select **Practicas2** target (main app)
2. **Build Phases** > **Link Binary With Libraries**
3. Add `WatchConnectivity.framework`

### Expo Prebuild Removes Extensions

**Solution**:
After running `expo prebuild --clean`, Xcode project is regenerated and loses custom targets.

**Workaround**:
1. Only run prebuild when absolutely necessary (e.g., after app.json changes)
2. After prebuild, re-add widget and watch targets using steps above
3. Consider creating a script to automate re-adding targets

**Alternative**: Switch to bare workflow and manage `ios/` directory manually (not recommended for Expo projects).

---

## Testing Checklist

Use this checklist to verify implementation:

- [ ] Run `npx expo prebuild --platform ios --clean`
- [ ] Open `ios/Practicas2.xcworkspace` in Xcode
- [ ] Create FocusBlocksWidget extension target
- [ ] Add App Groups capability to widget (group.com.focusblocks.app)
- [ ] Add SharedDataManager.swift to widget target
- [ ] Add widget files to widget target
- [ ] Build widget scheme successfully
- [ ] Add widget to home screen
- [ ] Start timer in app → Widget displays timer
- [ ] Widget updates every 5 seconds
- [ ] Pause timer → Widget shows "Paused"
- [ ] Stop timer → Widget shows empty state
- [ ] Create FocusBlocksWatch Watch App target
- [ ] Add Watch app files to watch target
- [ ] Add SharedDataManager.swift to watch target (for context reading)
- [ ] Add ComplicationController.swift to watch target
- [ ] Pair watch simulator with iPhone simulator
- [ ] Build watch app scheme successfully
- [ ] Start timer in iPhone → Watch displays timer
- [ ] Tap pause on watch → iPhone timer pauses
- [ ] Tap play on watch → iPhone timer resumes
- [ ] Tap skip on watch → iPhone skips block
- [ ] Add complication to watch face
- [ ] Complication displays live timer countdown
- [ ] Archive app for TestFlight
- [ ] Verify widget and watch extensions included in archive

---

## File Reference

### Main App Files
- `ios/Practicas2/SharedDataBridge.swift` - Writes to shared container
- `ios/Practicas2/SharedDataBridge.m` - Obj-C bridge
- `ios/Practicas2/WatchConnectivityManager.swift` - Watch communication
- `ios/Practicas2/WatchCommandBridge.swift` - Event emitter for watch commands
- `ios/Practicas2/WatchCommandBridge.m` - Obj-C bridge
- `ios/Practicas2/AppDelegate.swift` - Initializes WatchConnectivityManager
- `src/services/SharedDataService.js` - RN wrapper for native module
- `src/contexts/AppContext.js` - Calls SharedDataService on timer updates
- `src/components/WatchCommandHandler.js` - Listens for watch commands
- `App.js` - Renders WatchCommandHandler

### Shared Files
- `ios/Shared/SharedDataManager.swift` - Read shared container (used by widget + watch)

### Widget Files
- `ios/FocusBlocksWidget/FocusBlocksWidget.swift` - Widget provider and view
- `ios/FocusBlocksWidget/Info.plist` - Widget metadata
- `ios/FocusBlocksWidget/Assets.xcassets/` - Widget assets

### Watch App Files
- `ios/FocusBlocksWatch Watch App/FocusBlocksWatchApp.swift` - Watch app entry point
- `ios/FocusBlocksWatch Watch App/ContentView.swift` - Watch UI and WC delegate
- `ios/FocusBlocksWatch Watch App/ComplicationController.swift` - Watch face complications
- `ios/FocusBlocksWatch Watch App/Info.plist` - Watch metadata
- `ios/FocusBlocksWatch Watch App/Assets.xcassets/` - Watch assets

---

## Next Steps

After completing all testing:

1. **Update CLAUDE.md** with widget/watch architecture notes
2. **Create user documentation** for adding widget and watch app
3. **Submit to TestFlight** for beta testing
4. **Monitor crash reports** for widget/watch extension issues
5. **Consider Android widget** implementation (separate architecture)

---

## Support

For issues or questions:
- Check Xcode console logs for `[SharedDataBridge]`, `[WatchConnectivity]`, `[Watch]` prefixes
- Review Apple documentation:
  - [WidgetKit](https://developer.apple.com/documentation/widgetkit)
  - [Watch Connectivity](https://developer.apple.com/documentation/watchconnectivity)
  - [ClockKit Complications](https://developer.apple.com/documentation/clockkit)
