import SwiftUI

/// The twin's luminous portrait inside a pulsing neon ring.
struct TwinOrb: View {
    let diameter: CGFloat
    var isActive: Bool = true

    @State private var pulse: Bool = false

    var body: some View {
        ZStack {
            Circle()
                .fill(
                    RadialGradient(
                        colors: [Theme.magenta.opacity(0.36), .clear],
                        center: .center,
                        startRadius: diameter * 0.2,
                        endRadius: diameter * 0.78
                    )
                )
                .frame(width: diameter * 1.5, height: diameter * 1.5)
                .scaleEffect(pulse ? 1.06 : 0.94)
                .opacity(pulse ? 1 : 0.75)

            portrait
                .frame(width: diameter * 0.82, height: diameter * 0.82)
                .clipShape(.circle)

            // The glow radius is deliberately constant. Animating a shadow
            // radius re-rasterizes an offscreen blur every frame, and this
            // animation repeats forever on every screen that shows the orb —
            // scale and opacity give the same throb on the GPU for free.
            Circle()
                .strokeBorder(Theme.ringGradient, lineWidth: 3)
                .frame(width: diameter, height: diameter)
                .glow(Theme.magenta, radius: 20, opacity: 0.8)
                .scaleEffect(pulse ? 1.02 : 0.98)
                .opacity(pulse ? 1 : 0.82)
        }
        .frame(width: diameter * 1.5, height: diameter * 1.5)
        // Decorative, and 1.5x wider than the slot it is given, so it overhangs
        // whatever sits next to it. Hit-testable overhang steals drags from the
        // scroll view underneath it.
        .allowsHitTesting(false)
        .onAppear {
            guard isActive else { return }
            withAnimation(.easeInOut(duration: 2.4).repeatForever(autoreverses: true)) {
                pulse = true
            }
        }
        .accessibilityHidden(true)
    }

    private var portrait: some View {
        Group {
            if UIImage(named: "ai_woman_neon_halo") != nil {
                Image("ai_woman_neon_halo")
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else {
                Theme.surfaceHigh.overlay {
                    Image(systemName: "person.crop.circle")
                        .font(.system(size: diameter * 0.4, weight: .thin))
                        .foregroundStyle(Theme.magenta.opacity(0.7))
                }
            }
        }
    }
}

/// Small pulsing status dot used by "Twin online" and "Live" labels.
struct LiveDot: View {
    var color: Color = Theme.success
    @State private var on: Bool = false

    var body: some View {
        Circle()
            .fill(color)
            .frame(width: 8, height: 8)
            .glow(color, radius: 6, opacity: 0.9)
            .opacity(on ? 1 : 0.35)
            .onAppear {
                withAnimation(.easeInOut(duration: 1.1).repeatForever(autoreverses: true)) {
                    on = true
                }
            }
            .accessibilityHidden(true)
    }
}
