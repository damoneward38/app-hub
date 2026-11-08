import AuthenticationServices
import UIKit

/// Tells `ASWebAuthenticationSession` which window to present its sheet over.
///
/// Sign-in no longer uses a web session — email and password are entered in the
/// app — but YouTube consent still runs real Google OAuth in one, so this
/// outlived the auth flow it was originally written for.
final class WebAuthPresentationContext: NSObject, ASWebAuthenticationPresentationContextProviding {
    static let shared = WebAuthPresentationContext()

    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .flatMap(\.windows)
            .first { $0.isKeyWindow } ?? ASPresentationAnchor()
    }
}
