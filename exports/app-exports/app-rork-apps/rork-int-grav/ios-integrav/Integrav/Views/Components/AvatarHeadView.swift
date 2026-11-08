import SceneKit
import SwiftUI
import UIKit

/// Renders the fitted head with the capture projected onto it, driven live by
/// blend-shape weights.
///
/// The four morph targets built by `FaceMeshBuilder` are loaded into an
/// `SCNMorpher` in additive mode, so speech, smiles, blinks and brow motion can
/// all play at once — the same weight stream the Python prototype planned to
/// push over a WebSocket, generated locally instead.
struct AvatarHeadView: UIViewRepresentable {
    let mesh: FaceMeshData
    let texture: UIImage
    /// 0…1 jaw opening — drive it from the speech envelope.
    var mouthOpen: Double
    var smile: Double
    var browRaise: Double
    /// 0…1 eyelid close, driven by a performance program. Ignored while the
    /// head is blinking for itself.
    var blink: Double = 0
    /// Head rotation in radians from the performance engine, added on top of
    /// whatever the user has dragged the head to.
    var yaw: Double = 0
    var pitch: Double = 0
    var roll: Double = 0
    /// Idle sway and autonomous blinking. Turn this off when an engine is
    /// driving the head, or the two fight over the same euler angles.
    var isAlive: Bool = true
    /// Lets the user turn the head with a drag.
    var allowsInteraction: Bool = true

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeUIView(context: Context) -> SCNView {
        let view = SCNView()
        view.scene = context.coordinator.makeScene(mesh: mesh, texture: texture)
        view.backgroundColor = .clear
        view.antialiasingMode = .multisampling2X
        view.rendersContinuously = false
        view.isUserInteractionEnabled = allowsInteraction
        view.preferredFramesPerSecond = 60

        if allowsInteraction {
            let pan = UIPanGestureRecognizer(
                target: context.coordinator,
                action: #selector(Coordinator.handlePan(_:))
            )
            view.addGestureRecognizer(pan)
        }
        if isAlive { context.coordinator.startIdleLife() }
        return view
    }

    func updateUIView(_ uiView: SCNView, context: Context) {
        context.coordinator.reload(mesh: mesh, texture: texture)
        context.coordinator.apply(
            mouthOpen: mouthOpen,
            smile: smile,
            browRaise: browRaise,
            blink: isAlive ? nil : blink,
            angles: isAlive ? nil : (yaw, pitch, roll)
        )
    }

    static func dismantleUIView(_ uiView: SCNView, coordinator: Coordinator) {
        coordinator.stopIdleLife()
    }

    /// Owns the SceneKit graph so SwiftUI updates never rebuild geometry.
    final class Coordinator: NSObject {
        private var headNode: SCNNode?
        private var morpher: SCNMorpher?
        private var lifeTask: Task<Void, Never>?
        private var meshSignature: Int = 0
        private var yaw: Float = 0
        private var pitch: Float = 0

        func makeScene(mesh: FaceMeshData, texture: UIImage) -> SCNScene {
            let scene = SCNScene()
            scene.background.contents = UIColor.clear

            let head = SCNNode(geometry: AvatarHeadView.geometry(from: mesh, texture: texture))
            head.position = SCNVector3(0, 0, 0)
            scene.rootNode.addChildNode(head)
            headNode = head
            meshSignature = mesh.vertexCount &* 31 &+ mesh.triangleCount

            let morpher = SCNMorpher()
            morpher.calculationMode = .additive
            morpher.unifiesNormals = true
            morpher.targets = mesh.morphs.map { target in
                AvatarHeadView.targetGeometry(positions: target.positions, normals: target.normals, mesh: mesh)
            }
            head.morpher = morpher
            self.morpher = morpher

            let camera = SCNCamera()
            camera.fieldOfView = 38
            camera.wantsHDR = true
            camera.bloomIntensity = 0.35
            camera.bloomThreshold = 0.85
            let cameraNode = SCNNode()
            cameraNode.camera = camera
            cameraNode.position = SCNVector3(0, -0.02, 1.65)
            scene.rootNode.addChildNode(cameraNode)

            scene.rootNode.addChildNode(Coordinator.light(
                type: .omni, color: UIColor(white: 1, alpha: 1), intensity: 780,
                position: SCNVector3(0.7, 0.7, 1.5)
            ))
            scene.rootNode.addChildNode(Coordinator.light(
                type: .omni, color: UIColor(red: 0.91, green: 0.47, blue: 0.98, alpha: 1), intensity: 520,
                position: SCNVector3(-1.1, 0.35, -0.6)
            ))
            scene.rootNode.addChildNode(Coordinator.light(
                type: .omni, color: UIColor(red: 0.55, green: 0.36, blue: 0.96, alpha: 1), intensity: 340,
                position: SCNVector3(1.0, -0.5, -0.8)
            ))
            scene.rootNode.addChildNode(Coordinator.light(
                type: .ambient, color: UIColor(red: 0.35, green: 0.28, blue: 0.5, alpha: 1), intensity: 260,
                position: .init(0, 0, 0)
            ))

            return scene
        }

        private static func light(
            type: SCNLight.LightType,
            color: UIColor,
            intensity: CGFloat,
            position: SCNVector3
        ) -> SCNNode {
            let light = SCNLight()
            light.type = type
            light.color = color
            light.intensity = intensity
            let node = SCNNode()
            node.light = light
            node.position = position
            return node
        }

        /// Rebuilds geometry only when a genuinely different capture arrives.
        func reload(mesh: FaceMeshData, texture: UIImage) {
            let signature = mesh.vertexCount &* 31 &+ mesh.triangleCount
            guard let headNode else { return }
            if signature != meshSignature {
                headNode.geometry = AvatarHeadView.geometry(from: mesh, texture: texture)
                morpher?.targets = mesh.morphs.map { target in
                    AvatarHeadView.targetGeometry(positions: target.positions, normals: target.normals, mesh: mesh)
                }
                headNode.morpher = morpher
                meshSignature = signature
            } else {
                headNode.geometry?.firstMaterial?.diffuse.contents = texture
            }
        }

        /// `blink` and `angles` are nil while the head runs its own idle life,
        /// so autonomous blinking and the sway action are left alone.
        func apply(
            mouthOpen: Double,
            smile: Double,
            browRaise: Double,
            blink: Double?,
            angles: (yaw: Double, pitch: Double, roll: Double)?
        ) {
            guard let morpher else { return }
            SCNTransaction.begin()
            // A driven head gets a shorter blend: the engine already smooths at
            // 50 Hz, and layering an 80 ms ease on top turns snaps into mush.
            SCNTransaction.animationDuration = angles == nil ? 0.08 : 0.02
            morpher.setWeight(CGFloat(mouthOpen.clamped(to: 0...1)), forTargetAt: FaceMorph.mouthOpen.rawValue)
            morpher.setWeight(CGFloat(smile.clamped(to: 0...1)), forTargetAt: FaceMorph.smile.rawValue)
            morpher.setWeight(CGFloat(browRaise.clamped(to: 0...1)), forTargetAt: FaceMorph.browRaise.rawValue)
            if let blink {
                morpher.setWeight(CGFloat(blink.clamped(to: 0...1)), forTargetAt: FaceMorph.blink.rawValue)
            }
            if let angles {
                // Performance rotation is added to the drag, so a head turned by
                // hand is not overwritten fifty times a second.
                headNode?.eulerAngles = SCNVector3(
                    pitch + Float(angles.pitch),
                    yaw + Float(angles.yaw),
                    Float(angles.roll)
                )
            }
            SCNTransaction.commit()
        }

        /// Breathing sway plus involuntary blinks — the difference between a
        /// model and someone who is present.
        func startIdleLife() {
            guard lifeTask == nil, let headNode else { return }

            let sway = SCNAction.sequence([
                SCNAction.rotateBy(x: 0.02, y: 0.06, z: 0.01, duration: 2.6),
                SCNAction.rotateBy(x: -0.03, y: -0.09, z: -0.015, duration: 3.1),
                SCNAction.rotateBy(x: 0.01, y: 0.03, z: 0.005, duration: 2.4),
            ])
            sway.timingMode = .easeInEaseOut
            headNode.runAction(SCNAction.repeatForever(sway), forKey: "sway")

            lifeTask = Task { [weak self] in
                while !Task.isCancelled {
                    try? await Task.sleep(for: .milliseconds(Int.random(in: 2_600...6_200)))
                    guard let self, !Task.isCancelled else { return }
                    self.blink()
                }
            }
        }

        func stopIdleLife() {
            lifeTask?.cancel()
            lifeTask = nil
            headNode?.removeAllActions()
        }

        private func blink() {
            guard let morpher else { return }
            let index = FaceMorph.blink.rawValue
            SCNTransaction.begin()
            SCNTransaction.animationDuration = 0.07
            morpher.setWeight(1, forTargetAt: index)
            SCNTransaction.completionBlock = {
                SCNTransaction.begin()
                SCNTransaction.animationDuration = 0.11
                morpher.setWeight(0, forTargetAt: index)
                SCNTransaction.commit()
            }
            SCNTransaction.commit()
        }

        @objc func handlePan(_ gesture: UIPanGestureRecognizer) {
            guard let headNode, let view = gesture.view else { return }
            let translation = gesture.translation(in: view)
            let targetYaw = (yaw + Float(translation.x) * 0.006).clamped(to: -0.7...0.7)
            let targetPitch = (pitch + Float(translation.y) * 0.004).clamped(to: -0.32...0.32)

            SCNTransaction.begin()
            SCNTransaction.animationDuration = 0.05
            headNode.eulerAngles = SCNVector3(targetPitch, targetYaw, 0)
            SCNTransaction.commit()

            if gesture.state == .ended || gesture.state == .cancelled {
                yaw = targetYaw
                pitch = targetPitch
                gesture.setTranslation(.zero, in: view)
            }
        }
    }

    // MARK: - Geometry bridging

    static func geometry(from mesh: FaceMeshData, texture: UIImage) -> SCNGeometry {
        let geometry = SCNGeometry(
            sources: sources(positions: mesh.positions, normals: mesh.normals, uvs: mesh.uvs),
            elements: [SCNGeometryElement(indices: mesh.indices, primitiveType: .triangles)]
        )

        let material = SCNMaterial()
        material.lightingModel = .physicallyBased
        material.diffuse.contents = texture
        material.diffuse.wrapS = .clamp
        material.diffuse.wrapT = .clamp
        material.roughness.contents = 0.68
        material.metalness.contents = 0.0
        material.isDoubleSided = false
        geometry.materials = [material]
        return geometry
    }

    static func targetGeometry(
        positions: [SIMD3<Float>],
        normals: [SIMD3<Float>],
        mesh: FaceMeshData
    ) -> SCNGeometry {
        SCNGeometry(
            sources: sources(positions: positions, normals: normals, uvs: mesh.uvs),
            elements: [SCNGeometryElement(indices: mesh.indices, primitiveType: .triangles)]
        )
    }

    private static func sources(
        positions: [SIMD3<Float>],
        normals: [SIMD3<Float>],
        uvs: [SIMD2<Float>]
    ) -> [SCNGeometrySource] {
        [
            SCNGeometrySource(vertices: positions.map { SCNVector3($0.x, $0.y, $0.z) }),
            SCNGeometrySource(normals: normals.map { SCNVector3($0.x, $0.y, $0.z) }),
            SCNGeometrySource(textureCoordinates: uvs.map { CGPoint(x: CGFloat($0.x), y: CGFloat($0.y)) }),
        ]
    }
}
