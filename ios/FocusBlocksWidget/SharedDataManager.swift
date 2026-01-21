import Foundation

public struct SharedTimerState: Codable {
    public let blockId: String?
    public let blockTitle: String
    public let duration: Int
    public let isRunning: Bool
    public let isPaused: Bool
    public let startTimestamp: String?
    public let pauseTimestamp: String?
    public let totalPausedSeconds: Int
    public let lastUpdated: String

    public init(blockId: String?, blockTitle: String, duration: Int, isRunning: Bool, isPaused: Bool, startTimestamp: String?, pauseTimestamp: String?, totalPausedSeconds: Int, lastUpdated: String) {
        self.blockId = blockId
        self.blockTitle = blockTitle
        self.duration = duration
        self.isRunning = isRunning
        self.isPaused = isPaused
        self.startTimestamp = startTimestamp
        self.pauseTimestamp = pauseTimestamp
        self.totalPausedSeconds = totalPausedSeconds
        self.lastUpdated = lastUpdated
    }
}

public class SharedDataManager {
    public static let shared = SharedDataManager()

    private init() {}

    /// Reads the timer state from the App Groups shared container
    public func readTimerState() -> SharedTimerState? {
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
    public func calculateElapsed(from state: SharedTimerState) -> Int {
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
    public func calculateRemaining(from state: SharedTimerState) -> Int {
        let elapsed = calculateElapsed(from: state)
        let total = state.duration * 60
        return max(0, total - elapsed)
    }

    /// Calculates progress as a fraction (0.0 to 1.0)
    /// - Parameter state: The shared timer state
    /// - Returns: Progress fraction
    public func calculateProgress(from state: SharedTimerState) -> Double {
        guard state.duration > 0 else { return 0.0 }
        let elapsed = calculateElapsed(from: state)
        let total = state.duration * 60
        let progress = Double(elapsed) / Double(total)
        return min(1.0, max(0.0, progress))
    }
}
