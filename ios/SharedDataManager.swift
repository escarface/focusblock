import Foundation

struct SharedTimerState: Codable {
    let blockId: String?
    let blockTitle: String
    let duration: Int
    let isRunning: Bool
    let isPaused: Bool
    let startTimestamp: String?
    let pauseTimestamp: String?
    let totalPausedSeconds: Int
    let lastUpdated: String
}

class SharedDataManager {
    static let shared = SharedDataManager()

    private init() {}

    /// Reads the timer state from the App Groups shared container
    func readTimerState() -> SharedTimerState? {
        guard let sharedURL = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: "group.com.focusblocks.app"
        ) else {
            print("[SharedDataManager] Failed to get shared container URL")
            return nil
        }

        let fileURL = sharedURL.appendingPathComponent("shared_timer_state.json")

        guard let data = try? Data(contentsOf: fileURL) else {
            print("[SharedDataManager] No shared timer state file found")
            return nil
        }

        do {
            let state = try JSONDecoder().decode(SharedTimerState.self, from: data)
            print("[SharedDataManager] Read timer state: \(state.blockTitle)")
            return state
        } catch {
            print("[SharedDataManager] Failed to decode timer state: \(error)")
            return nil
        }
    }

    /// Calculates elapsed seconds based on timestamp and paused time
    /// - Parameter state: The shared timer state
    /// - Returns: Elapsed seconds (0 if timer not running)
    func calculateElapsed(from state: SharedTimerState) -> Int {
        guard state.isRunning,
              let startStr = state.startTimestamp,
              let startDate = ISO8601DateFormatter().date(from: startStr) else {
            return 0
        }

        let now = Date()
        let totalElapsed = Int(now.timeIntervalSince(startDate))
        let elapsed = totalElapsed - state.totalPausedSeconds

        return max(0, elapsed)
    }

    /// Calculates remaining seconds for the timer
    /// - Parameter state: The shared timer state
    /// - Returns: Remaining seconds (0 if complete or not running)
    func calculateRemaining(from state: SharedTimerState) -> Int {
        let elapsed = calculateElapsed(from: state)
        let total = state.duration * 60
        return max(0, total - elapsed)
    }

    /// Calculates progress as a fraction (0.0 to 1.0)
    /// - Parameter state: The shared timer state
    /// - Returns: Progress fraction
    func calculateProgress(from state: SharedTimerState) -> Double {
        guard state.duration > 0 else { return 0.0 }
        let elapsed = calculateElapsed(from: state)
        let total = state.duration * 60
        let progress = Double(elapsed) / Double(total)
        return min(1.0, max(0.0, progress))
    }
}
