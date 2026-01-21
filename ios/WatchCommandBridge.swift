import Foundation
import React

@objc(WatchCommandBridge)
class WatchCommandBridge: RCTEventEmitter {

    static var shared: WatchCommandBridge?

    override init() {
        super.init()
        WatchCommandBridge.shared = self

        // Listen for watch command notifications
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleWatchCommand(_:)),
            name: .watchCommand,
            object: nil
        )
        print("[WatchCommandBridge] Initialized and listening for watch commands")
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    @objc func handleWatchCommand(_ notification: Notification) {
        guard let command = notification.userInfo?["command"] as? String else {
            print("[WatchCommandBridge] No command in notification")
            return
        }

        print("[WatchCommandBridge] Forwarding command to React Native: \(command)")

        // Send event to React Native
        sendEvent(withName: "watchCommand", body: ["command": command])
    }

    // Required: Return all supported event names
    override func supportedEvents() -> [String]! {
        return ["watchCommand"]
    }

    // Required: Module requires main queue setup
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }

    // Required: Allow module to send events even when no listeners
    override func constantsToExport() -> [AnyHashable : Any]! {
        return ["supportsWatchCommands": true]
    }
}
