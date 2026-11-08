import Foundation

/// A billing month of metered usage. Dispatches are requests to the engine
/// (a tap, a hotkey, a typed call, one chain run); executions are the
/// individual functions the twin actually performed.
nonisolated struct UsageWindow: Codable, Equatable, Sendable {
    var periodStart: Date
    var calls: Int
    var executions: Int

    nonisolated init(periodStart: Date = UsageWindow.startOfMonth(for: .now), calls: Int = 0, executions: Int = 0) {
        self.periodStart = periodStart
        self.calls = calls
        self.executions = executions
    }

    nonisolated static func startOfMonth(for date: Date) -> Date {
        let calendar = Calendar.current
        let parts = calendar.dateComponents([.year, .month], from: date)
        return calendar.date(from: parts) ?? calendar.startOfDay(for: date)
    }

    /// True once the calendar month has rolled over and the meters should reset.
    nonisolated func isStale(at date: Date = .now) -> Bool {
        UsageWindow.startOfMonth(for: date) > periodStart
    }

    nonisolated var resetDate: Date {
        Calendar.current.date(byAdding: .month, value: 1, to: periodStart) ?? periodStart
    }

    nonisolated var daysUntilReset: Int {
        let days = Calendar.current.dateComponents([.day], from: .now, to: resetDate).day ?? 0
        return max(0, days)
    }

    nonisolated var resetLabel: String {
        let days = daysUntilReset
        return days == 0 ? "resets today" : "resets in \(days)d"
    }

    /// Fraction of a cap consumed, clamped to 0...1. Unlimited reads as 0.
    nonisolated func fraction(of cap: Int?, used: Int) -> Double {
        guard let cap, cap > 0 else { return 0 }
        return min(1, Double(used) / Double(cap))
    }
}
