import AVFoundation
import Foundation
import Observation

/// Main-actor facade over `CameraSession`: permission, lifecycle, one-shot capture.
@Observable
final class CameraController {
    enum State: Equatable {
        case idle
        case denied
        case unavailable
        case live
    }

    private(set) var state: State = .idle
    private(set) var isCapturing: Bool = false

    let session = CameraSession()

    /// Asks for permission if needed, then wires and starts the session.
    func start() async {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            break
        case .notDetermined:
            let granted = await AVCaptureDevice.requestAccess(for: .video)
            guard granted else {
                state = .denied
                return
            }
        case .denied, .restricted:
            state = .denied
            return
        @unknown default:
            state = .denied
            return
        }

        guard session.configure() else {
            state = .unavailable
            return
        }
        session.start()
        state = .live
    }

    func stop() {
        session.stop()
    }

    /// Captures one frame as JPEG/HEIC data.
    func capture() async -> Data? {
        guard state == .live, !isCapturing else { return nil }
        isCapturing = true
        defer { isCapturing = false }

        let data: Data? = await withCheckedContinuation { continuation in
            session.capture { result in
                switch result {
                case .success(let data):
                    continuation.resume(returning: data)
                case .failure:
                    continuation.resume(returning: nil)
                }
            }
        }
        return data
    }
}
