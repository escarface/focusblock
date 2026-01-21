import Foundation
import WatchConnectivity

class WatchConnectivityManager: NSObject, WCSessionDelegate {
    static let shared = WatchConnectivityManager()

    private override init() {
        super.init()
        if WCSession.isSupported() {
            let session = WCSession.default
            session.delegate = self
            session.activate()
            print("[WatchConnectivity] Session activated")
        } else {
            print("[WatchConnectivity] WCSession not supported on this device")
        }
    }

    /// Sends timer update to Apple Watch
    func sendTimerUpdate() {
        guard WCSession.default.activationState == .activated else {
            print("[WatchConnectivity] Session not activated, skipping update")
            return
        }

        guard let state = SharedDataManager.shared.readTimerState() else {
            print("[WatchConnectivity] No timer state to send")
            return
        }

        let elapsed = SharedDataManager.shared.calculateElapsed(from: state)

        let message: [String: Any] = [
            "action": "timerUpdate",
            "blockTitle": state.blockTitle,
            "duration": state.duration,
            "isRunning": state.isRunning,
            "isPaused": state.isPaused,
            "elapsedSeconds": elapsed
        ]

        // Send message if watch is reachable (immediate)
        if WCSession.default.isReachable {
            WCSession.default.sendMessage(message, replyHandler: nil) { error in
                print("[WatchConnectivity] Failed to send message: \(error.localizedDescription)")
            }
            print("[WatchConnectivity] Sent timer update to watch")
        }

        // Also update application context (persists when app backgrounded)
        do {
            try WCSession.default.updateApplicationContext([
                "blockTitle": state.blockTitle,
                "duration": state.duration,
                "elapsedSeconds": elapsed,
                "isRunning": state.isRunning,
                "isPaused": state.isPaused,
                "lastUpdated": state.lastUpdated
            ])
            print("[WatchConnectivity] Updated application context")
        } catch {
            print("[WatchConnectivity] Failed to update context: \(error.localizedDescription)")
        }
    }

    // MARK: - WCSessionDelegate

    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        if let error = error {
            print("[WatchConnectivity] Activation failed: \(error.localizedDescription)")
        } else {
            print("[WatchConnectivity] Activation completed with state: \(activationState.rawValue)")
        }
    }

    func sessionDidBecomeInactive(_ session: WCSession) {
        print("[WatchConnectivity] Session became inactive")
    }

    func sessionDidDeactivate(_ session: WCSession) {
        print("[WatchConnectivity] Session deactivated, reactivating...")
        WCSession.default.activate()
    }

    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        print("[WatchConnectivity] Received message from watch: \(message)")

        guard let action = message["action"] as? String else {
            print("[WatchConnectivity] No action in message")
            return
        }

        // Post notification to be handled by React Native
        DispatchQueue.main.async {
            NotificationCenter.default.post(
                name: .watchCommand,
                object: nil,
                userInfo: ["command": action]
            )
            print("[WatchConnectivity] Posted notification for command: \(action)")
        }
    }

    func sessionReachabilityDidChange(_ session: WCSession) {
        print("[WatchConnectivity] Reachability changed: \(session.isReachable)")
    }
}

// MARK: - Notification Name Extension

extension Notification.Name {
    static let watchCommand = Notification.Name("watchCommand")
}
