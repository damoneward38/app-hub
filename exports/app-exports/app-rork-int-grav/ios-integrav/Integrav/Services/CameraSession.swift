import AVFoundation
import Foundation

nonisolated enum CameraError: LocalizedError, Sendable {
    case noDevice
    case notAuthorized
    case captureFailed

    var errorDescription: String? {
        switch self {
        case .noDevice: return "No camera is attached to this device."
        case .notAuthorized: return "Camera access is off for Intégrav."
        case .captureFailed: return "The photo could not be captured."
        }
    }
}

/// The AVFoundation capture stack, off the main actor.
///
/// Owns its own serial queue because `AVCaptureSession` configuration and
/// `startRunning()` must never touch the main thread.
nonisolated final class CameraSession: NSObject, @unchecked Sendable {
    let session = AVCaptureSession()

    private let photoOutput = AVCapturePhotoOutput()
    private let queue = DispatchQueue(label: "app.integrav.camera.session")
    private var completion: (@Sendable (Result<Data, Error>) -> Void)?
    private var isConfigured = false

    /// Discovers a usable camera. The cloud simulator exposes the developer's
    /// webcam as an `.external` device, so that type has to be in the list.
    static func preferredDevice() -> AVCaptureDevice? {
        let discovery = AVCaptureDevice.DiscoverySession(
            deviceTypes: [
                .builtInWideAngleCamera,
                .builtInTrueDepthCamera,
                .external,
                .continuityCamera,
            ],
            mediaType: .video,
            position: .unspecified
        )
        let devices = discovery.devices
        return devices.first { $0.position == .front }
            ?? devices.first { $0.deviceType == .external || $0.deviceType == .continuityCamera }
            ?? devices.first
    }

    /// Wires the device into the session. Returns false when no camera exists.
    func configure() -> Bool {
        if isConfigured { return true }
        guard let device = CameraSession.preferredDevice(),
              let input = try? AVCaptureDeviceInput(device: device) else {
            return false
        }

        session.beginConfiguration()
        session.sessionPreset = .photo
        if session.canAddInput(input) { session.addInput(input) }
        if session.canAddOutput(photoOutput) { session.addOutput(photoOutput) }
        if let connection = photoOutput.connection(with: .video), connection.isVideoMirroringSupported {
            connection.automaticallyAdjustsVideoMirroring = false
            connection.isVideoMirrored = device.position == .front
        }
        session.commitConfiguration()
        isConfigured = true
        return true
    }

    func start() {
        queue.async { [session] in
            guard !session.isRunning else { return }
            session.startRunning()
        }
    }

    func stop() {
        queue.async { [session] in
            guard session.isRunning else { return }
            session.stopRunning()
        }
    }

    func capture(_ handler: @escaping @Sendable (Result<Data, Error>) -> Void) {
        guard isConfigured else {
            handler(.failure(CameraError.noDevice))
            return
        }
        completion = handler
        let settings = AVCapturePhotoSettings()
        photoOutput.capturePhoto(with: settings, delegate: self)
    }
}

extension CameraSession: @preconcurrency AVCapturePhotoCaptureDelegate {
    nonisolated func photoOutput(
        _ output: AVCapturePhotoOutput,
        didFinishProcessingPhoto photo: AVCapturePhoto,
        error: Error?
    ) {
        let handler = completion
        completion = nil
        if let error {
            handler?(.failure(error))
            return
        }
        guard let data = photo.fileDataRepresentation() else {
            handler?(.failure(CameraError.captureFailed))
            return
        }
        handler?(.success(data))
    }
}
