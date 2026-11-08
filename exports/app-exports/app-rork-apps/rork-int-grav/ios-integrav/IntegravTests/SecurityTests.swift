import CryptoKit
import Foundation
import Testing
import UIKit
@testable import Integrav

/// The encryption story only holds if these are true, so they are asserted
/// rather than assumed. The pure entry points are used deliberately: they take
/// an explicit key, so nothing here touches the shared Keychain item or the
/// identity the rest of the suite is running under.
@Suite("Encrypted storage")
struct SecureStoreTests {
    private func key(_ identity: String) -> SymmetricKey {
        SecureStore.derive(master: Data(repeating: 7, count: 32), identity: identity)
    }

    @Test func aSealedValueComesBackIntact() throws {
        let secret = Data("keynote_2026.mp4 · 42 minutes".utf8)
        let envelope = try #require(SecureStore.seal(secret, with: key("user-a")))
        #expect(SecureStore.open(envelope, with: key("user-a")) == secret)
    }

    @Test func theCiphertextDoesNotContainThePlaintext() throws {
        let secret = Data("my-private-training-clip".utf8)
        let envelope = try #require(SecureStore.seal(secret, with: key("user-a")))
        // The whole point: lifting the container yields nothing readable.
        #expect(envelope.range(of: secret) == nil)
    }

    @Test func anotherAccountOnTheSamePhoneCannotRead() throws {
        let secret = Data("user A's twin".utf8)
        let envelope = try #require(SecureStore.seal(secret, with: key("user-a")))
        // Same device master key, different account: the derived keys differ,
        // so B gets nothing rather than getting A's records.
        #expect(SecureStore.open(envelope, with: key("user-b")) == nil)
    }

    @Test func adifferentDeviceKeyCannotRead() throws {
        let secret = Data("user A's twin".utf8)
        let envelope = try #require(SecureStore.seal(secret, with: key("user-a")))
        let otherDevice = SecureStore.derive(
            master: Data(repeating: 9, count: 32),
            identity: "user-a"
        )
        // A backup restored onto another phone has no master key to derive from.
        #expect(SecureStore.open(envelope, with: otherDevice) == nil)
    }

    @Test func tamperedCiphertextIsRejectedRatherThanReturned() throws {
        let secret = Data("licence: enterprise".utf8)
        var envelope = try #require(SecureStore.seal(secret, with: key("user-a")))
        envelope[envelope.count - 1] ^= 0xFF
        // AES-GCM authenticates: an edited record fails instead of decoding
        // into something the app would trust.
        #expect(SecureStore.open(envelope, with: key("user-a")) == nil)
    }

    @Test func everySealUsesAFreshNonce() throws {
        let secret = Data("same input".utf8)
        let first = try #require(SecureStore.seal(secret, with: key("user-a")))
        let second = try #require(SecureStore.seal(secret, with: key("user-a")))
        // Identical plaintext must not produce identical bytes, or an observer
        // could tell when a value went back to a previous state.
        #expect(first != second)
    }

    @Test func recordsWrittenBeforeEncryptionAreRecognisedNotDiscarded() {
        let legacy = Data(#"[{"name":"vlog.mov"}]"#.utf8)
        // Existing installs must keep their work; plaintext is reported so the
        // store can migrate it rather than dropping it on the floor.
        #expect(SecureStore.shared.open(legacy) == .legacyPlaintext(legacy))
    }

    @Test func aSealedEnvelopeIsNeverMistakenForPlaintext() throws {
        let envelope = try #require(SecureStore.seal(Data("x".utf8), with: key("user-a")))
        #expect(envelope.starts(with: SecureStore.magic))
        if case .legacyPlaintext = SecureStore.shared.open(envelope) {
            Issue.record("A sealed value was treated as legacy plaintext")
        }
    }

    @Test func derivationIsStableForTheSameIdentity() {
        #expect(key("user-a") == key("user-a"))
        #expect(key("user-a") != key(SecureStore.deviceIdentity))
    }
}

@Suite("Store keys")
struct StoreKeyTests {
    @Test func everyKeyIsUnique() {
        #expect(Set(StoreKey.all).count == StoreKey.all.count)
    }

    @Test func theRekeyListCoversTheStoresThatHoldPersonalData() {
        // Re-keying on sign-in and the vault's erase both walk `all`. A key
        // missing from it would be left sealed under the previous account.
        for key in [
            StoreKey.videos, StoreKey.messages, StoreKey.faceCapture,
            StoreKey.mimicTakes, StoreKey.callLog, StoreKey.orders,
            StoreKey.brand, StoreKey.planTier,
        ] {
            #expect(StoreKey.all.contains(key))
        }
    }
}

@Suite("Imported clips")
struct SourceVideoTests {
    @Test func aRecordWithNoFileIsNotPlayable() {
        let logged = SourceVideo(name: "keynote.mp4", minutes: 42)
        #expect(!logged.isPlayable)
        #expect(logged.url == nil)
    }

    @Test func aShortClipReportsSecondsRatherThanRoundingToAMinute() {
        let clip = SourceVideo(name: "take.mov", minutes: 1, seconds: 48)
        #expect(clip.durationLabel == "48 sec")
        #expect(clip.stampLabel == "00:48")
    }

    @Test func realFootageStampsItsOwnLength() {
        let clip = SourceVideo(name: "podcast.mov", minutes: 72, seconds: 4_335)
        #expect(clip.stampLabel == "72:15")
    }

    @Test func lengthOnlyRecordsKeepTheOldLabels() {
        let logged = SourceVideo(name: "podcast.mov", minutes: 72)
        #expect(logged.durationLabel == "1:12")
        #expect(logged.stampLabel == "01:12")
    }

    @Test func trainingMinutesRoundToTheNearestMinute() {
        #expect(SourceVideo.trainingMinutes(forSeconds: 100) == 2)
        #expect(SourceVideo.trainingMinutes(forSeconds: 89) == 1)
        // A clip under a minute was still ingested, so it still counts.
        #expect(SourceVideo.trainingMinutes(forSeconds: 5) == 1)
    }

    @Test func olderRecordsDecodeWithoutTheNewFields() throws {
        let stored = Data(##"""
        {"id":"6B1F5D2E-0000-4000-8000-000000000001","name":"legacy.mov","minutes":30,"addedAt":760000000}
        """##.utf8)
        let decoded = try JSONDecoder().decode(SourceVideo.self, from: stored)
        #expect(decoded.name == "legacy.mov")
        #expect(decoded.fileName == nil)
        #expect(decoded.seconds == nil)
        #expect(!decoded.isPlayable)
    }
}

@Suite("Media library")
struct MediaLibraryTests {
    /// Renders at scale 1 so a point is a pixel — a default renderer bakes in
    /// the screen scale, and the reloaded JPEG reports pixel dimensions.
    private func swatch(width: Int, height: Int, color: UIColor) -> UIImage {
        let size = CGSize(width: width, height: height)
        let format = UIGraphicsImageRendererFormat.default()
        format.scale = 1
        return UIGraphicsImageRenderer(size: size, format: format).image { context in
            color.setFill()
            context.fill(CGRect(origin: .zero, size: size))
        }
    }

    @Test func animageSurvivesTheRoundTrip() throws {
        let source = swatch(width: 12, height: 8, color: .magenta)

        let name = try MediaLibrary.importImage(source)
        defer { MediaLibrary.remove(name) }

        #expect(MediaLibrary.exists(name))
        let loaded = try #require(MediaLibrary.image(named: name))
        #expect(Int(loaded.size.width) == 12)
        #expect(Int(loaded.size.height) == 8)
    }

    @Test func aMissingFileIsReportedMissing() {
        #expect(!MediaLibrary.exists("does-not-exist.mov"))
        #expect(!MediaLibrary.exists(nil))
        #expect(MediaLibrary.image(named: "does-not-exist.jpg") == nil)
    }

    @Test func removingAfileClearsIt() throws {
        let source = swatch(width: 4, height: 4, color: .black)
        let name = try MediaLibrary.importImage(source)
        #expect(MediaLibrary.exists(name))
        MediaLibrary.remove(name)
        #expect(!MediaLibrary.exists(name))
    }
}
