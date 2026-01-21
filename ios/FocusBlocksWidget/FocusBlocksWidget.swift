import WidgetKit
import SwiftUI

private let appGroupId = "group.com.focusblocks.app"
private let sharedFileName = "shared_timer_state.json"

private func accentColor(from value: String?) -> Color {
    switch value {
    case "pink":
        return Color(hex: "#D4918A")
    case "yellow":
        return Color(hex: "#E5B85C")
    case "green":
        return Color(hex: "#8BA888")
    case "orange":
        return Color(hex: "#D4714A")
    case "gray":
        return Color(hex: "#9B9082")
    default:
        return Color(hex: "#D4714A")
    }
}

struct SharedTimerState: Codable {
    let blockId: String?
    let blockTitle: String?
    let blockColor: String?
    let blockCategory: String?
    let duration: Int?
    let isRunning: Bool?
    let isPaused: Bool?
    let startTimestamp: String?
    let pauseTimestamp: String?
    let totalPausedSeconds: Int?
    let lastUpdated: String?
}

struct DisplayState {
    let title: String
    let remainingSeconds: Int?
    let totalSeconds: Int?
    let isRunning: Bool
    let endDate: Date?
    let isPaused: Bool
    let accent: Color
    let isBreak: Bool
    let isComplete: Bool
}

struct FocusBlocksEntry: TimelineEntry {
    let date: Date
    let state: DisplayState?
}

struct FocusBlocksProvider: TimelineProvider {
    func placeholder(in context: Context) -> FocusBlocksEntry {
        FocusBlocksEntry(
            date: Date(),
            state: DisplayState(
                title: "Focus",
                remainingSeconds: 900,
                totalSeconds: 1500,
                isRunning: true,
                endDate: Date().addingTimeInterval(900),
                isPaused: false,
                accent: .orange,
                isBreak: false,
                isComplete: false
            )
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (FocusBlocksEntry) -> Void) {
        completion(FocusBlocksEntry(date: Date(), state: loadState()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<FocusBlocksEntry>) -> Void) {
        let now = Date()
        let currentState = loadState()
        var entries: [FocusBlocksEntry] = [
            FocusBlocksEntry(date: now, state: currentState)
        ]

        if let state = currentState,
           state.isRunning,
           state.isPaused == false,
           let endDate = state.endDate,
           endDate > now {
            let completionState = DisplayState(
                title: state.title,
                remainingSeconds: 0,
                totalSeconds: state.totalSeconds,
                isRunning: false,
                endDate: nil,
                isPaused: false,
                accent: state.accent,
                isBreak: state.isBreak,
                isComplete: true
            )
            entries.append(FocusBlocksEntry(date: endDate, state: completionState))
            completion(Timeline(entries: entries, policy: .atEnd))
            return
        }

        let nextRefresh = Calendar.current.date(byAdding: .minute, value: 1, to: now) ?? now.addingTimeInterval(60)
        completion(Timeline(entries: entries, policy: .after(nextRefresh)))
    }

    private func loadState() -> DisplayState? {
        guard let sharedURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupId) else {
            return nil
        }

        let fileURL = sharedURL.appendingPathComponent(sharedFileName)
        guard let data = try? Data(contentsOf: fileURL) else {
            return nil
        }

        guard let sharedState = try? JSONDecoder().decode(SharedTimerState.self, from: data) else {
            return nil
        }

        return computeDisplayState(from: sharedState)
    }

    private func computeDisplayState(from state: SharedTimerState) -> DisplayState? {
        let title = state.blockTitle ?? "No active timer"
        let isRunning = state.isRunning ?? false
        let isPaused = state.isPaused ?? false
        let totalSeconds = (state.duration ?? 0) * 60
        let accent = accentColor(from: state.blockColor)
        let isBreak = state.blockCategory == "break"

        guard totalSeconds > 0, let startTimestamp = state.startTimestamp else {
            return DisplayState(
                title: title,
                remainingSeconds: nil,
                totalSeconds: nil,
                isRunning: isRunning,
                endDate: nil,
                isPaused: isPaused,
                accent: accent,
                isBreak: isBreak,
                isComplete: false
            )
        }

        guard let startDate = parseISODate(startTimestamp) else {
            return DisplayState(
                title: title,
                remainingSeconds: nil,
                totalSeconds: nil,
                isRunning: isRunning,
                endDate: nil,
                isPaused: isPaused,
                accent: accent,
                isBreak: isBreak,
                isComplete: false
            )
        }

        let pauseTimestamp = state.pauseTimestamp.flatMap { parseISODate($0) }
        let totalPaused = TimeInterval(state.totalPausedSeconds ?? 0)
        let now = isPaused ? (pauseTimestamp ?? Date()) : Date()
        let elapsed = max(0, now.timeIntervalSince(startDate) - totalPaused)
        let remaining = max(0, totalSeconds - Int(elapsed))
        let endDate = startDate.addingTimeInterval(TimeInterval(totalSeconds) + totalPaused)

        let shouldShowTimer = (isRunning || isPaused) && remaining > 0
        let isComplete = (isRunning || isPaused) && remaining == 0
        let displayTitle = isComplete ? title : (shouldShowTimer ? title : "No active timer")
        let displayRemaining = shouldShowTimer ? remaining : nil
        let displayTotal = shouldShowTimer ? totalSeconds : nil

        return DisplayState(
            title: displayTitle,
            remainingSeconds: displayRemaining,
            totalSeconds: displayTotal,
            isRunning: isRunning,
            endDate: endDate,
            isPaused: isPaused,
            accent: accent,
            isBreak: isBreak,
            isComplete: isComplete
        )
    }

    private func parseISODate(_ value: String) -> Date? {
        let formatterWithFractional = ISO8601DateFormatter()
        formatterWithFractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatterWithFractional.date(from: value) {
            return date
        }

        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter.date(from: value)
    }
}

struct FocusBlocksWidgetEntryView: View {
    let entry: FocusBlocksProvider.Entry
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.widgetFamily) private var family

    var body: some View {
        let palette = colorScheme == .dark ? WidgetPalette.dark : WidgetPalette.light
        let isCompact = family == .systemSmall
        let progress = progressFraction(entry.state)
        let isBreak = entry.state?.isBreak == true
        let accent = isBreak ? palette.breakAccent : (entry.state?.accent ?? palette.primary)
        let tintOpacity = colorScheme == .dark ? 0.2 : 0.12
        let surfaceTint = accent.opacity(tintOpacity)
        let baseOpacity = colorScheme == .dark ? 0.9 : 0.92

        ZStack {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [
                            palette.surface.opacity(baseOpacity),
                            palette.surfaceAlt.opacity(baseOpacity),
                            surfaceTint
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .stroke(palette.border, lineWidth: 1)
                )

            VStack(alignment: .leading, spacing: isCompact ? 10 : 12) {
                HStack(spacing: 8) {
                    Text(isBreak ? "BREAK" : "FOCUS")
                        .font(.system(size: 10, weight: .semibold))
                        .tracking(0.8)
                        .foregroundStyle(accent)

                    Circle()
                        .fill(accent)
                        .frame(width: 6, height: 6)

                    Spacer()

                    Text(entry.state?.isComplete == true ? "Completed" : (entry.state?.isPaused == true ? "Paused" : "Running"))
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(entry.state?.isPaused == true ? palette.textPrimary : palette.textSecondary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 3)
                        .background(
                            Capsule(style: .continuous)
                                .fill(entry.state?.isPaused == true ? palette.border : Color.clear)
                        )
                }

                Text(entry.state?.title ?? "No active timer")
                    .font(.system(size: isCompact ? 16 : 18, weight: .semibold))
                    .foregroundStyle(palette.textPrimary)
                    .lineLimit(1)

                if entry.state?.isComplete == true {
                    HStack(alignment: .center, spacing: isCompact ? 12 : 16) {
                        ZStack {
                            Circle()
                                .stroke(palette.timerBackground, lineWidth: 8)

                            Circle()
                                .trim(from: 0, to: 1)
                                .stroke(
                                    accent,
                                    style: StrokeStyle(lineWidth: 8, lineCap: .round)
                                )
                                .rotationEffect(.degrees(-90))
                        }
                        .frame(width: isCompact ? 48 : 56, height: isCompact ? 48 : 56)

                        VStack(alignment: .leading, spacing: 4) {
                            Text("00:00")
                                .font(.system(size: isCompact ? 24 : 28, weight: .semibold, design: .rounded))
                                .foregroundStyle(palette.textPrimary)
                                .monospacedDigit()
                            Text("Completed")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundStyle(palette.textSecondary)
                        }
                    }
                } else if let remaining = entry.state?.remainingSeconds,
                   let total = entry.state?.totalSeconds,
                   total > 0 {
                    HStack(alignment: .center, spacing: isCompact ? 12 : 16) {
                        ZStack {
                            Circle()
                                .stroke(palette.timerBackground, lineWidth: 8)

                            Circle()
                                .trim(from: 0, to: progress ?? 0)
                                .stroke(
                                    accent,
                                    style: StrokeStyle(lineWidth: 8, lineCap: .round)
                                )
                                .rotationEffect(.degrees(-90))
                        }
                        .frame(width: isCompact ? 48 : 56, height: isCompact ? 48 : 56)

                        VStack(alignment: .leading, spacing: 4) {
                            if let endDate = entry.state?.endDate, entry.state?.isPaused == false, remaining > 0 {
                                Text(endDate, style: .timer)
                                    .font(.system(size: isCompact ? 24 : 28, weight: .semibold, design: .rounded))
                                    .foregroundStyle(palette.textPrimary)
                                    .monospacedDigit()
                            } else {
                                Text(formatSeconds(remaining))
                                    .font(.system(size: isCompact ? 24 : 28, weight: .semibold, design: .rounded))
                                    .foregroundStyle(palette.textPrimary)
                                    .monospacedDigit()
                            }

                            Text("\(formatSeconds(total)) total")
                                .font(.system(size: 11, weight: .medium))
                                .foregroundStyle(palette.textSecondary)
                        }
                    }
                } else {
                    Text("Start a focus block")
                        .font(.system(size: 14, weight: .regular))
                        .foregroundStyle(palette.textSecondary)
                }
            }
            .padding(isCompact ? 14 : 16)
        }
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .modifier(WidgetBackground(palette: palette))
    }

    private func formatSeconds(_ seconds: Int) -> String {
        let minutes = seconds / 60
        let secs = seconds % 60
        return String(format: "%02d:%02d", minutes, secs)
    }

    private func progressFraction(_ state: DisplayState?) -> Double? {
        guard let remaining = state?.remainingSeconds,
              let total = state?.totalSeconds,
              total > 0 else {
            return nil
        }

        return min(1, max(0, Double(total - remaining) / Double(total)))
    }
}

struct FocusBlocksWidget: Widget {
    let kind: String = "FocusBlocksWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FocusBlocksProvider()) { entry in
            FocusBlocksWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("FocusBlocks Timer")
        .description("Shows your current focus block.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

private struct WidgetPalette {
    let primary: Color
    let primaryLight: Color
    let breakAccent: Color
    let background: Color
    let surface: Color
    let surfaceAlt: Color
    let textPrimary: Color
    let textSecondary: Color
    let border: Color
    let timerBackground: Color

    static let light = WidgetPalette(
        primary: Color(hex: "#D4714A"),
        primaryLight: Color(hex: "#E8956E"),
        breakAccent: Color(hex: "#E5B85C"),
        background: Color(hex: "#FAF6F1"),
        surface: Color(hex: "#FFFFFF"),
        surfaceAlt: Color(hex: "#FDF9F4"),
        textPrimary: Color(hex: "#3D3D3D"),
        textSecondary: Color(hex: "#8B8B8B"),
        border: Color(hex: "#E5DED4"),
        timerBackground: Color(hex: "#E5DED4")
    )

    static let dark = WidgetPalette(
        primary: Color(hex: "#E5A63D"),
        primaryLight: Color(hex: "#F0B84A"),
        breakAccent: Color(hex: "#E5B85C"),
        background: Color(hex: "#1A1612"),
        surface: Color(hex: "#2E2820"),
        surfaceAlt: Color(hex: "#3A332A"),
        textPrimary: Color(hex: "#F5F0E8"),
        textSecondary: Color(hex: "#A89F94"),
        border: Color(hex: "#3D352C"),
        timerBackground: Color(hex: "#3D352C")
    )

}

private struct WidgetBackground: ViewModifier {
    let palette: WidgetPalette

    func body(content: Content) -> some View {
        if #available(iOS 17.0, *) {
            content.containerBackground(palette.background, for: .widget)
        } else {
            content
        }
    }
}

private extension Color {
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var value: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&value)

        let r = Double((value >> 16) & 0xFF) / 255.0
        let g = Double((value >> 8) & 0xFF) / 255.0
        let b = Double(value & 0xFF) / 255.0

        self.init(red: r, green: g, blue: b)
    }
}

@main
struct FocusBlocksWidgetBundle: WidgetBundle {
    var body: some Widget {
        FocusBlocksWidget()
    }
}

@available(iOS 17.0, *)
#Preview(as: .systemSmall) {
    FocusBlocksWidget()
} timeline: {
    FocusBlocksEntry(
        date: Date(),
        state: DisplayState(
            title: "Focus",
            remainingSeconds: 420,
            totalSeconds: 1500,
            isRunning: true,
            endDate: Date().addingTimeInterval(420),
            isPaused: false,
            accent: .orange,
            isBreak: false,
            isComplete: false
        )
    )
}

@available(iOS 17.0, *)
#Preview(as: .systemMedium) {
    FocusBlocksWidget()
} timeline: {
    FocusBlocksEntry(
        date: Date(),
        state: DisplayState(
            title: "Break",
            remainingSeconds: 120,
            totalSeconds: 300,
            isRunning: false,
            endDate: Date().addingTimeInterval(120),
            isPaused: true,
            accent: .orange,
            isBreak: true,
            isComplete: false
        )
    )
}
