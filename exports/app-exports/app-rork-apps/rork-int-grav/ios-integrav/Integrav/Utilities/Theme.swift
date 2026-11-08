import SwiftUI

/// Intégrav visual system: violet-void canvas, magenta accent, luminous surfaces.
enum Theme {
    static let canvas = Color(hex: 0x0D0714)
    static let surface = Color(hex: 0x1A1029)
    static let surfaceHigh = Color(hex: 0x221638)
    static let border = Color(hex: 0x3A2A55)
    static let textPrimary = Color(hex: 0xF3EFFA)
    static let textSecondary = Color(hex: 0x9C93B8)
    static let magenta = Color(hex: 0xE879F9)
    static let violet = Color(hex: 0x8B5CF6)
    static let success = Color(hex: 0x34D399)
    static let warning = Color(hex: 0xF59E0B)

    static let accentGradient = LinearGradient(
        colors: [magenta, violet],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let ringGradient = AngularGradient(
        colors: [violet, magenta, Color(hex: 0xFDA4F5), magenta, violet],
        center: .center
    )

    static let cardCorner: CGFloat = 20
    static let controlCorner: CGFloat = 16
}

extension Color {
    init(hex: UInt32, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: alpha
        )
    }

    /// `#RRGGBB`, `RRGGBB` or `#RGB` from a user-typed field.
    ///
    /// A half-typed hex is normal while someone edits a text field, so an
    /// unparseable value falls back to `fallback` instead of crashing or
    /// flashing black under the cursor.
    init(hexString: String, fallback: Color = Theme.surfaceHigh) {
        let cleaned = hexString
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "#", with: "")
            .uppercased()
        let expanded = cleaned.count == 3 ? cleaned.map { "\($0)\($0)" }.joined() : cleaned
        guard expanded.count == 6, let value = UInt32(expanded, radix: 16) else {
            self = fallback
            return
        }
        self.init(hex: value)
    }
}

extension View {
    /// Standard elevated panel used across every Intégrav screen.
    func integravCard(highlight: Bool = false) -> some View {
        background(
            RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
                .fill(highlight ? Theme.surfaceHigh : Theme.surface)
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.cardCorner, style: .continuous)
                .strokeBorder(Theme.border.opacity(highlight ? 0.9 : 0.55), lineWidth: 1)
        )
    }

    func glow(_ color: Color, radius: CGFloat = 18, opacity: Double = 0.55) -> some View {
        shadow(color: color.opacity(opacity), radius: radius)
    }
}
