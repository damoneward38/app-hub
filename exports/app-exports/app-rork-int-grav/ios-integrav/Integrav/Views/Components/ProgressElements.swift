import SwiftUI

/// Glowing circular progress dial used for training and capacity.
struct GlowRing: View {
    let progress: Double
    var diameter: CGFloat = 120
    var lineWidth: CGFloat = 10

    var body: some View {
        ZStack {
            Circle()
                .strokeBorder(Theme.border.opacity(0.7), lineWidth: lineWidth)

            Circle()
                .trim(from: 0, to: max(0.001, min(1, progress)))
                .stroke(
                    Theme.ringGradient,
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .glow(Theme.magenta, radius: 12, opacity: 0.7)
                .animation(.easeInOut(duration: 0.8), value: progress)
        }
        .frame(width: diameter, height: diameter)
    }
}

/// Thin gradient progress track used by fleet rows and dispatched tasks.
struct GlowBar: View {
    let progress: Double
    var height: CGFloat = 6
    var tint: LinearGradient = Theme.accentGradient

    var body: some View {
        GeometryReader { proxy in
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(Theme.border.opacity(0.55))
                Capsule()
                    .fill(tint)
                    .frame(width: max(4, proxy.size.width * max(0, min(1, progress))))
                    .glow(Theme.magenta, radius: 6, opacity: 0.5)
            }
        }
        .frame(height: height)
        .animation(.easeInOut(duration: 0.5), value: progress)
    }
}

/// Round icon badge with a soft violet halo.
struct KindBadge: View {
    let kind: TaskKind
    var size: CGFloat = 52
    var accent: Color = Theme.violet

    var body: some View {
        ZStack {
            Circle()
                .fill(accent.opacity(0.16))
            Circle()
                .strokeBorder(accent.opacity(0.75), lineWidth: 1.5)
                .glow(accent, radius: 10, opacity: 0.5)
            Image(systemName: kind.symbol)
                .font(.system(size: size * 0.4, weight: .semibold))
                .foregroundStyle(accent)
        }
        .frame(width: size, height: size)
        .accessibilityHidden(true)
    }
}

/// Big monospaced live number used for the running-task counter.
struct LiveCounter: View {
    let value: Int

    var body: some View {
        Text(value.formatted(.number.grouping(.automatic)))
            .font(.system(size: 52, weight: .bold, design: .monospaced))
            .foregroundStyle(Theme.success)
            .glow(Theme.success, radius: 18, opacity: 0.55)
            .contentTransition(.numericText())
            .animation(.easeOut(duration: 0.4), value: value)
            .monospacedDigit()
    }
}
