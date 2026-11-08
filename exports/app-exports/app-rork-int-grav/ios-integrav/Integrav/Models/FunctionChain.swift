import Foundation

/// An ordered sequence of avatar functions the twin performs back to back.
nonisolated struct FunctionChain: Identifiable, Codable, Hashable, Sendable {
    let id: UUID
    var name: String
    var steps: [String]
    var createdAt: Date

    nonisolated init(id: UUID = UUID(), name: String, steps: [String], createdAt: Date = .now) {
        self.id = id
        self.name = name
        self.steps = steps
        self.createdAt = createdAt
    }

    nonisolated var stepLabel: String {
        steps.count == 1 ? "1 step" : "\(steps.count) steps"
    }
}
