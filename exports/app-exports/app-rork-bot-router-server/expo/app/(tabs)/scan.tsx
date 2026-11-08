import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { QrCode, Camera, AlertCircle, RefreshCw, Wifi } from "lucide-react-native";
import { router } from "expo-router";
import { trpc, checkBackendHealth } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";

export default function ScanScreen() {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [CameraComponent, setCameraComponent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const utils = trpc.useUtils();

  console.log('🔍 Scan screen rendered');
  console.log('👤 User:', user ? 'Logged in' : 'Not logged in');
  console.log('📊 Scan count:', scanCount);

  useEffect(() => {
    const checkBackend = async () => {
      console.log('🏥 Running backend health check...');
      const health = await checkBackendHealth();
      setBackendStatus(health.ok ? 'online' : 'offline');
      console.log('🏥 Backend status:', health.ok ? 'ONLINE' : 'OFFLINE');
      if (!health.ok) {
        setError(health.message);
      }
    };
    checkBackend();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web") {
      setHasPermission(false);
      return;
    }

    (async () => {
      try {
        const { Camera } = await import("expo-camera");
        const { CameraView } = await import("expo-camera");
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === "granted");
        setCameraComponent(() => CameraView);
      } catch (error) {
        console.error("Camera setup error:", error);
      }
    })();
  }, []);

  const subscriptionQuery = trpc.subscriptions.getStatus.useQuery(undefined, {
    enabled: !!user,
    retry: false,
  });

  useEffect(() => {
    if (subscriptionQuery.error) {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] ❌ Subscription check error:`, subscriptionQuery.error.message);
      setError(`Backend connection failed: ${subscriptionQuery.error.message}`);
    } else if (subscriptionQuery.isError) {
      console.error('❌ Subscription query in error state');
    }
  }, [subscriptionQuery.error, subscriptionQuery.isError]);

  const createMutation = trpc.releases.create.useMutation({
    onSuccess: async () => {
      console.log('✅ Release created successfully');
      setScanCount(prev => prev + 1);
      await utils.releases.getAll.invalidate();
      setScanned(false);
      setError(null);
      Alert.alert(
        "Success!",
        "Release added successfully!",
        [
          {
            text: "View Releases",
            onPress: () => router.push("/"),
          },
          {
            text: "Scan Another",
            onPress: () => {
              setScanned(false);
            },
          },
        ]
      );
    },
    onError: (error) => {
      console.error('❌ Create release error:', error.message);
      setScanned(false);
      setError(error.message);
      Alert.alert("Error", error.message, [
        { text: "OK", onPress: () => setError(null) },
      ]);
    },
  });

  const handleBarcodeScanned = useCallback(({ data }: { data: string }) => {
    const timestamp = new Date().toISOString();
    
    if (scanned || createMutation.isPending) {
      console.log(`[${timestamp}] ⏸️ Scan blocked - already processing`);
      return;
    }
    
    setScanned(true);
    setError(null);

    console.log(`[${timestamp}] 📸 QR Code scanned`);
    console.log(`[${timestamp}] 📏 Data length:`, data.length);
    console.log(`[${timestamp}] 📄 Raw data:`, data.substring(0, 200));

    try {
      const parsed = JSON.parse(data);
      console.log(`[${timestamp}] 📦 Parsed JSON:`, JSON.stringify(parsed, null, 2));
      
      if (parsed.artist && parsed.track) {
        console.log(`[${timestamp}] ✅ Valid QR data:`, { artist: parsed.artist, track: parsed.track });
        console.log(`[${timestamp}] 🚀 Sending mutation to backend...`);
        createMutation.mutate({
          artist: parsed.artist,
          track: parsed.track,
          timestamp: "now",
        });
        return;
      } else {
        console.error(`[${timestamp}] ❌ Missing artist or track in JSON:`, parsed);
      }
    } catch (parseError) {
      console.log(`[${timestamp}] ⚠️ Not JSON, trying colon format`);
      console.log(`[${timestamp}] ⚠️ Parse error:`, parseError);
      
      if (data.includes(":")) {
        const [artist, ...trackParts] = data.split(":");
        const track = trackParts.join(":");
        console.log(`[${timestamp}] 🔍 Parsed colon format - Artist: '${artist}', Track: '${track}'`);
        
        if (artist.trim() && track.trim()) {
          console.log(`[${timestamp}] ✅ Valid colon format:`, { artist: artist.trim(), track: track.trim() });
          console.log(`[${timestamp}] 🚀 Sending mutation to backend...`);
          createMutation.mutate({
            artist: artist.trim(),
            track: track.trim(),
            timestamp: "now",
          });
          return;
        }
      }
    }

    console.error(`[${timestamp}] ❌ Invalid QR code format`);
    console.error(`[${timestamp}] ❌ Full raw data:`, data);
    setScanned(false);
    setError('Invalid QR code format - must be JSON with artist/track or "Artist: Track" format');
    Alert.alert("Invalid QR Code", "This QR code doesn't contain valid release data.\n\nExpected format:\n• JSON: {\"artist\": \"Name\", \"track\": \"Title\"}\n• Text: Artist: Track", [
      { text: "OK", onPress: () => setError(null) },
    ]);
  }, [scanned, createMutation]);

  if (backendStatus === 'offline') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Wifi size={48} color="#ff4444" />
          <Text style={styles.title}>Backend Offline</Text>
          <Text style={styles.message}>{error || 'Cannot connect to server'}</Text>
          <Text style={styles.helpText}>
            The backend server at Railway may be down. Please check:
            {"\n"}• Server is running on Railway
            {"\n"}• URL is correct in lib/trpc.ts
            {"\n"}• No network issues
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={async () => {
              setBackendStatus('checking');
              setError(null);
              const health = await checkBackendHealth();
              setBackendStatus(health.ok ? 'online' : 'offline');
              if (!health.ok) {
                setError(health.message);
              }
            }}
          >
            <RefreshCw size={20} color="#000" />
            <Text style={styles.buttonText}>Check Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (backendStatus === 'checking') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.title}>Checking Backend...</Text>
          <Text style={styles.message}>Verifying server connection</Text>
        </View>
      </View>
    );
  }

  if (error && !user) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <AlertCircle size={48} color="#ff4444" />
          <Text style={styles.title}>Connection Error</Text>
          <Text style={styles.message}>{error}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setError(null);
              subscriptionQuery.refetch();
            }}
          >
            <RefreshCw size={20} color="#000" />
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <AlertCircle size={48} color="#ff4444" />
          <Text style={styles.title}>Login Required</Text>
          <Text style={styles.message}>
            Please log in to use the scanner
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/(tabs)/profile" as any)}
          >
            <Text style={styles.buttonText}>Go to Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!subscriptionQuery.isLoading && !subscriptionQuery.data?.hasSubscription) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <AlertCircle size={48} color="#FFD700" />
          <Text style={styles.title}>Premium Required</Text>
          <Text style={styles.message}>
            Active subscription needed to scan releases
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.premiumButton]}
            onPress={() => router.push("/(tabs)/subscription" as any)}
          >
            <Text style={styles.buttonText}>Upgrade</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <QrCode size={64} color="#666" />
          <Text style={styles.title}>Camera Not Available</Text>
          <Text style={styles.message}>
            Please use a mobile device to scan QR codes
          </Text>
        </View>
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Camera size={48} color="#1DB954" />
          <Text style={styles.title}>Camera Permission</Text>
          <Text style={styles.message}>
            We need camera access to scan QR codes
          </Text>
        </View>
      </View>
    );
  }

  if (!CameraComponent) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1DB954" />
          <Text style={styles.message}>Loading camera...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraComponent
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </CameraComponent>
      </View>

      <View style={styles.footer}>
        {createMutation.isPending ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color="#1DB954" />
            <Text style={styles.footerTitle}>Processing Release...</Text>
            <Text style={styles.footerText}>Please wait</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <AlertCircle size={40} color="#ff4444" />
            <Text style={styles.errorTitle}>Scan Failed</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setError(null);
                setScanned(false);
              }}
            >
              <RefreshCw size={16} color="#000" />
              <Text style={styles.resetButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.readyContainer}>
            <QrCode size={40} color="#1DB954" />
            <Text style={styles.footerTitle}>Scan QR Code</Text>
            <Text style={styles.footerText}>
              Point camera at a QR code to scan
            </Text>
            {scanCount > 0 && (
              <Text style={styles.scanCountText}>
                Scanned: {scanCount} release{scanCount !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        )}

        {scanned && !createMutation.isPending && !error && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              console.log('🔄 Reset scan button pressed');
              setScanned(false);
              setError(null);
            }}
          >
            <RefreshCw size={16} color="#000" />
            <Text style={styles.resetButtonText}>Scan Another</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },
  helpText: {
    fontSize: 13,
    color: "#666",
    textAlign: "left",
    lineHeight: 20,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  button: {
    backgroundColor: "#1DB954",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  premiumButton: {
    backgroundColor: "#FFD700",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  cameraContainer: {
    flex: 3,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#1DB954",
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 12,
  },
  footer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#1a1a1a",
  },
  processingContainer: {
    gap: 12,
    alignItems: "center",
  },
  readyContainer: {
    gap: 12,
    alignItems: "center",
  },
  errorContainer: {
    gap: 12,
    alignItems: "center",
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  footerText: {
    fontSize: 15,
    color: "#b3b3b3",
    textAlign: "center",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ff4444",
  },
  errorMessage: {
    fontSize: 14,
    color: "#ff6666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  scanCountText: {
    fontSize: 12,
    color: "#1DB954",
    marginTop: 4,
    fontWeight: "600",
  },
  resetButton: {
    backgroundColor: "#1DB954",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
});
