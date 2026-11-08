import AVFoundation
import CoreMedia
import Foundation

/// Live capture stack for body tracking.
///
/// `CameraSession` takes one photo; this one streams frames. It keeps its own
/// `AVCaptureVideoDataOutput` and runs Vision on the capture queue, so pose
/// detection never touches the main thread.
nonisolated final class PoseCameraSession: NSObject, AVCaptureVideoDataOutputSampleBufferDelegate, @unchecked Sendable {
    let session = AVCaptureSession()

    /// Called on the capture queue for every frame that produced a pose.
    /// `aspect` is the buffer's width ÷ height, which the overlay needs to line
    /// the skeleton up with an aspect-fill preview.
    var onFrame: (@Sendable (BodyPoseFrame?, Double) -> Void)?

    private let output = AVCaptureVideoDataOutput()
    private let queue = DispatchQueue(label: "app.integrav.pose.session")
    private var isConfigured = false
    private var isMirrored = false
    private var lastAnalysis: TimeInterval = 0

    /// Vision is asked for a pose at most this often. The preview still runs at
    /// full frame rate; detecting on every frame burns battery for motion the
    /// smoothing filter would flatten anyway.
    private let minimumInterval: TimeInterval = 1.0 / 15.0

    /// True when the frames arriving are mirrored in the preview, which happens
    /// on any front-facing camera.
    var previewIsMirrored: Bool { isMirrored }

    func configure() -> Bool {
        if isConfigured { return true }
        guard let device = CameraSession.preferredDevice(),
              let input = try? AVCaptureDeviceInput(device: device) else {
            return false
        }

        session.beginConfiguration()
        // A 720p feed is plenty for pose; higher presets cost frame time and
        // Vision downsamples anyway.
        session.sessionPreset = session.canSetSessionPreset(.hd1280x720) ? .hd1280x720 : .high
        if session.canAddInput(input) { session.addInput(input) }

        output.videoSettings = [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA
        ]
        output.alwaysDiscardsLateVideoFrames = true
        output.setSampleBufferDelegate(self, queue: queue)
        if session.canAddOutput(output) { session.addOutput(output) }

        if let connection = output.connection(with: .video) {
            // Rotate at the connection so buffers arrive upright and Vision can
            // be handed `.up` — rotating afterwards means every joint needs the
            // same correction applied by hand.
            if connection.isVideoRotationAngleSupported(90) {
                connection.videoRotationAngle = 90
            }
            if connection.isVideoMirroringSupported {
                connection.automaticallyAdjustsVideoMirroring = false
                connection.isVideoMirrored = device.position == .front
                isMirrored = connection.isVideoMirrored
            }
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
}

// The conformance is declared on the class itself, which is `nonisolated`:
// declaring it on an extension makes it main-actor isolated by default, and the
// capture queue cannot use a main-actor conformance.
extension PoseCameraSession {
    nonisolated func captureOutput(
        _ output: AVCaptureOutput,
        didOutput sampleBuffer: CMSampleBuffer,
        from connection: AVCaptureConnection
    ) {
        guard let handler = onFrame,
              let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }

        let seconds = CMTimeGetSeconds(CMSampleBufferGetPresentationTimeStamp(sampleBuffer))
        let stamp = seconds.isFinite ? seconds : Date().timeIntervalSinceReferenceDate
        guard stamp - lastAnalysis >= minimumInterval else { return }
        lastAnalysis = stamp

        let width = Double(CVPixelBufferGetWidth(pixelBuffer))
        let height = Double(CVPixelBufferGetHeight(pixelBuffer))
        let aspect = height > 0 ? width / height : 1

        do {
            let frame = try BodyPoseService.detect(
                in: pixelBuffer,
                orientation: .up,
                timestamp: stamp
            )
            handler(frame, aspect)
        } catch {
            // A single failed frame is not worth reporting; the next one is
            // 66ms away. Persistent failure shows up as "no person in frame".
            handler(nil, aspect)
        }
    }
}
