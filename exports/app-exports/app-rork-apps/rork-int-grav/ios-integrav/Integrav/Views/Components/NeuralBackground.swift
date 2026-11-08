import SwiftUI

/// Atmospheric violet-void backdrop: radial magenta glow plus a faint neural
/// constellation. Deterministic so it never flickers between renders.
struct NeuralBackground: View {
    var intensity: Double = 1

    /// Static: the constellation is identical on every screen, so it is built
    /// once for the whole app instead of on each re-render of every view that
    /// shows it (the engine heartbeat rebuilds those roughly once a second).
    private static let nodes: [CGPoint] = {
        var generator = SeededGenerator(seed: 20_260_831)
        return (0..<70).map { _ in
            CGPoint(
                x: Double.random(in: 0...1, using: &generator),
                y: Double.random(in: 0...1, using: &generator)
            )
        }
    }()

    var body: some View {
        ZStack {
            Theme.canvas

            RadialGradient(
                colors: [Theme.magenta.opacity(0.24 * intensity), .clear],
                center: UnitPoint(x: 0.5, y: 0.14),
                startRadius: 8,
                endRadius: 420
            )

            RadialGradient(
                colors: [Theme.violet.opacity(0.20 * intensity), .clear],
                center: UnitPoint(x: 0.08, y: 0.62),
                startRadius: 4,
                endRadius: 360
            )

            Canvas { context, size in
                for node in NeuralBackground.nodes {
                    let point = CGPoint(x: node.x * size.width, y: node.y * size.height)
                    let radius = 1.0 + node.x * 1.6
                    let rect = CGRect(
                        x: point.x - radius,
                        y: point.y - radius,
                        width: radius * 2,
                        height: radius * 2
                    )
                    context.fill(
                        Path(ellipseIn: rect),
                        with: .color(Theme.violet.opacity(0.35 * intensity))
                    )
                }

                var path = Path()
                let nodes = NeuralBackground.nodes
                for index in stride(from: 0, to: nodes.count - 1, by: 3) {
                    let a = CGPoint(x: nodes[index].x * size.width, y: nodes[index].y * size.height)
                    let b = CGPoint(x: nodes[index + 1].x * size.width, y: nodes[index + 1].y * size.height)
                    if hypot(a.x - b.x, a.y - b.y) < size.width * 0.34 {
                        path.move(to: a)
                        path.addLine(to: b)
                    }
                }
                context.stroke(
                    path,
                    with: .color(Theme.violet.opacity(0.14 * intensity)),
                    lineWidth: 0.6
                )
            }
        }
        .ignoresSafeArea()
        // Purely decorative. `Canvas` is hit-testable by default, so without this
        // the backdrop swallows taps and scroll drags across the whole screen.
        .allowsHitTesting(false)
    }
}

/// Reproducible pseudo-random source so generated visuals stay stable.
struct SeededGenerator: RandomNumberGenerator {
    private var state: UInt64

    init(seed: UInt64) {
        state = seed == 0 ? 0x9E3779B97F4A7C15 : seed
    }

    mutating func next() -> UInt64 {
        state ^= state << 13
        state ^= state >> 7
        state ^= state << 17
        return state
    }
}

#Preview {
    NeuralBackground()
}
