import Foundation
import WidgetKit

@objc(SharedDataBridge)
class SharedDataBridge: NSObject {

    @objc
    func writeTimerState(_ data: NSDictionary) {
        guard let sharedURL = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: "group.com.focusblocks.app"
        ) else {
            print("[SharedDataBridge] Failed to get shared container URL")
            return
        }

        let fileURL = sharedURL.appendingPathComponent("shared_timer_state.json")

        do {
            let jsonData = try JSONSerialization.data(withJSONObject: data, options: [])
            try jsonData.write(to: fileURL, options: [.atomic])
            print("[SharedDataBridge] Successfully wrote timer state")
            WidgetCenter.shared.reloadTimelines(ofKind: "FocusBlocksWidget")
        } catch {
            print("[SharedDataBridge] Failed to write timer state: \(error)")
        }
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
