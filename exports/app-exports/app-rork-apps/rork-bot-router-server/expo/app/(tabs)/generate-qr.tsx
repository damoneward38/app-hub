import { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { QrCode, Music, User, RefreshCw, AlertCircle, CheckCircle, Zap, TestTube2 } from "lucide-react-native";

export default function GenerateQRScreen() {
  const [artist, setArtist] = useState("");
  const [track, setTrack] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [generationId, setGenerationId] = useState(0);
  const qrDataRef = useRef<string>("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [testResults, setTestResults] = useState<{timestamp: string, success: boolean, message: string}[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const refreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleGenerate = useCallback(async (silent: boolean = false) => {
    if (!artist.trim() || !track.trim()) {
      if (!silent) Alert.alert("Missing Info", "Please enter both artist and track name");
      return;
    }

    setIsGenerating(true);
    setError(null);

    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🎨 Starting QR generation (silent: ${silent})`);
    console.log(`[${timestamp}] 📝 Artist:`, artist.trim());
    console.log(`[${timestamp}] 🎵 Track:`, track.trim());

    try {
      const payload = JSON.stringify({ 
        artist: artist.trim(), 
        track: track.trim(),
        generated: timestamp,
        id: Date.now()
      });
      
      console.log(`[${timestamp}] 📦 QR Payload:`, payload);
      console.log(`[${timestamp}] 📏 Payload length:`, payload.length, 'bytes');
      
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(payload)}&format=png&margin=10`;
      
      console.log(`[${timestamp}] ✅ QR code URL generated`);
      console.log(`[${timestamp}] 🔗 QR URL:`, qrUrl);
      console.log(`[${timestamp}] 🔑 QR Data stored for verification`);
      
      qrDataRef.current = payload;
      setQrImage(qrUrl);
      setLastGenerated(new Date());
      setGenerationId(prev => prev + 1);
      
      setTestResults(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        success: true,
        message: `QR code generated successfully (${payload.length} bytes)`
      }, ...prev.slice(0, 9)]);
      
      if (!silent) {
        Alert.alert(
          "✅ QR Code Ready",
          `Generated for ${artist.trim()} - ${track.trim()}\n\nScan this with the Scan QR tab to test.`,
          [{ text: "Got it" }]
        );
      }
      
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true })
      ]).start();
      
    } catch (err: any) {
      console.error(`[${timestamp}] ❌ QR generation failed:`, err);
      console.error(`[${timestamp}] ❌ Error name:`, err?.name);
      console.error(`[${timestamp}] ❌ Error message:`, err?.message);
      console.error(`[${timestamp}] ❌ Error stack:`, err?.stack);
      setError(err?.message || 'Failed to generate QR code');
      
      setTestResults(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        success: false,
        message: `Generation failed: ${err?.message || 'Unknown error'}`
      }, ...prev.slice(0, 9)]);
      
      if (!silent) {
        Alert.alert("QR Generation Failed", `Error: ${err?.message || 'Unknown error'}\n\nPlease try again.`);
      }
    } finally {
      setIsGenerating(false);
    }
  }, [artist, track, pulseAnim]);

  const handleReset = useCallback(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔄 Resetting QR generator - clearing all state`);
    setArtist("");
    setTrack("");
    setQrImage("");
    setError(null);
    setLastGenerated(null);
    qrDataRef.current = "";
    setGenerationId(0);
    setAutoRefresh(false);
    setCountdown(0);
    setTestResults([]);
    console.log(`[${timestamp}] ✅ Reset complete - ready for new generation`);
  }, []);

  const handleRefresh = useCallback(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔄 Refreshing QR code - regenerating with same data`);
    setGenerationId(prev => prev + 1);
    handleGenerate(true);
  }, [handleGenerate]);

  const handleForceRefresh = useCallback(() => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔄 Force refreshing entire screen`);
    setQrImage("");
    setError(null);
    setTimeout(() => {
      if (artist.trim() && track.trim()) {
        handleGenerate(true);
      }
    }, 100);
  }, [artist, track, handleGenerate]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  useEffect(() => {
    console.log('🎯 Generate QR screen mounted');
    return () => {
      console.log('👋 Generate QR screen unmounted');
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (autoRefresh && qrImage) {
      setCountdown(10);
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 10;
          }
          return prev - 1;
        });
      }, 1000);

      refreshInterval.current = setInterval(() => {
        console.log('🔄 Auto-refresh triggered');
        handleRefresh();
      }, 10000);

      return () => {
        clearInterval(countdownTimer);
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
      };
    } else {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
        refreshInterval.current = null;
      }
      setCountdown(0);
    }
  }, [autoRefresh, qrImage, handleRefresh]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <QrCode size={40} color="#1DB954" />
          <Text style={styles.title}>Generate QR Code</Text>
          <Text style={styles.subtitle}>Create QR codes for testing</Text>
          <TouchableOpacity 
            style={styles.forceRefreshButton}
            onPress={handleForceRefresh}
          >
            <RefreshCw size={20} color="#fff" />
            <Text style={styles.forceRefreshText}>Force Refresh Screen</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <User size={16} color="#999" />
              <Text style={styles.label}>Artist</Text>
            </View>
            <TextInput
              style={styles.input}
              value={artist}
              onChangeText={setArtist}
              placeholder="Enter artist name"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Music size={16} color="#999" />
              <Text style={styles.label}>Track</Text>
            </View>
            <TextInput
              style={styles.input}
              value={track}
              onChangeText={setTrack}
              placeholder="Enter track name"
              placeholderTextColor="#666"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.generateButton,
              (!artist.trim() || !track.trim() || isGenerating) && styles.generateButtonDisabled
            ]}
            onPress={() => handleGenerate(false)}
            disabled={!artist.trim() || !track.trim() || isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Zap size={20} color="#000" />
                <Text style={styles.generateButtonText}>Generate QR Code</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorCard}>
            <AlertCircle size={24} color="#ff4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => handleGenerate(false)}>
              <RefreshCw size={16} color="#fff" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {qrImage && (
          <View style={styles.qrSection}>
            <View style={styles.qrHeader}>
              <Text style={styles.qrTitle}>Scan this QR code</Text>
              <View style={styles.headerControls}>
                <TouchableOpacity 
                  style={[styles.autoRefreshButton, autoRefresh && styles.autoRefreshButtonActive]} 
                  onPress={toggleAutoRefresh}
                >
                  <RefreshCw size={16} color={autoRefresh ? "#000" : "#1DB954"} />
                  <Text style={[styles.autoRefreshText, autoRefresh && styles.autoRefreshTextActive]}>
                    Auto {countdown > 0 ? countdown : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.refreshButton} 
                  onPress={handleRefresh}
                  disabled={isGenerating}
                >
                  <RefreshCw size={20} color="#1DB954" />
                </TouchableOpacity>
              </View>
            </View>
            
            <Animated.View style={[styles.qrWrapper, { transform: [{ scale: pulseAnim }] }]}>
              <Image
                source={{ uri: qrImage }}
                style={styles.qrImage}
                resizeMode="contain"
                key={`qr-${generationId}-${qrImage.substring(0, 50)}`}
              />
            </Animated.View>
            
            <View style={styles.statusBadge}>
              <CheckCircle size={16} color="#1DB954" />
              <Text style={styles.statusText}>Ready to Scan</Text>
            </View>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>📋 QR Code Data</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Artist:</Text>
                <Text style={styles.infoValue}>{artist}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>Track:</Text>
                <Text style={styles.infoValue}>{track}</Text>
              </View>
              {lastGenerated && (
                <View style={styles.timestampRow}>
                  <Text style={styles.timestampLabel}>🕐 Generated:</Text>
                  <Text style={styles.timestamp}>
                    {lastGenerated.toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={styles.formatInfo}>
                <Text style={styles.formatLabel}>Format: JSON</Text>
                <Text style={styles.formatDetails}>
                  {JSON.stringify({ artist: artist.trim(), track: track.trim() }, null, 2)}
                </Text>
              </View>
            </View>
            
            {testResults.length > 0 && (
              <View style={styles.testResultsCard}>
                <View style={styles.testResultsHeader}>
                  <TestTube2 size={20} color="#1DB954" />
                  <Text style={styles.testResultsTitle}>Test Log</Text>
                </View>
                {testResults.map((result, idx) => (
                  <View key={idx} style={styles.testResultItem}>
                    <Text style={styles.testResultTime}>{result.timestamp}</Text>
                    <View style={styles.testResultContent}>
                      {result.success ? (
                        <CheckCircle size={14} color="#1DB954" />
                      ) : (
                        <AlertCircle size={14} color="#ff4444" />
                      )}
                      <Text style={[styles.testResultMessage, !result.success && styles.testResultError]}>
                        {result.message}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>📱 How to Test:</Text>
              <Text style={styles.instructions}>
                1. Keep this QR code on screen{"\n"}
                2. Go to the &quot;Scan QR&quot; tab{"\n"}
                3. Point your camera at this QR code{"\n"}
                4. Wait for automatic scanning
              </Text>
              <Text style={styles.instructionsNote}>
                💡 Enable Auto-Refresh to regenerate QR every 10s
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.resetButton} 
              onPress={handleReset}
            >
              <RefreshCw size={16} color="#fff" />
              <Text style={styles.resetButtonText}>Reset & Generate New</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  inputContainer: {
    gap: 10,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#b3b3b3",
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
  },
  generateButton: {
    backgroundColor: "#1DB954",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 12,
    minHeight: 54,
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  generateButtonDisabled: {
    backgroundColor: "#333",
    opacity: 0.5,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  errorCard: {
    backgroundColor: "#2a1515",
    borderWidth: 1,
    borderColor: "#ff4444",
    borderRadius: 12,
    padding: 20,
    gap: 12,
    alignItems: "center",
    marginVertical: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#ff6666",
    textAlign: "center",
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ff4444",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  qrSection: {
    alignItems: "center",
    gap: 20,
    paddingVertical: 24,
  },
  qrHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  autoRefreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1DB954",
  },
  autoRefreshButtonActive: {
    backgroundColor: "#1DB954",
  },
  autoRefreshText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1DB954",
    minWidth: 40,
  },
  autoRefreshTextActive: {
    color: "#000",
  },
  qrTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1DB954",
  },
  refreshButton: {
    padding: 8,
  },
  qrWrapper: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
  },
  qrImage: {
    width: 280,
    height: 280,
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1DB954",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  infoKey: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
    width: 60,
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  timestampRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  timestampLabel: {
    fontSize: 11,
    color: "#999",
  },
  timestamp: {
    fontSize: 11,
    color: "#666",
  },
  forceRefreshButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: "#FF6B00",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  forceRefreshText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
  formatInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
    gap: 8,
  },
  formatLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1DB954",
    textTransform: "uppercase" as const,
  },
  formatDetails: {
    fontSize: 11,
    color: "#888",
    fontFamily: "monospace" as const,
    backgroundColor: "#0a0a0a",
    padding: 12,
    borderRadius: 8,
  },
  resetButton: {
    backgroundColor: "#333",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 8,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#0a3d1f",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1DB954",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1DB954",
  },
  instructionsCard: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1DB954",
  },
  instructions: {
    fontSize: 14,
    color: "#b3b3b3",
    lineHeight: 22,
  },
  instructionsNote: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic" as const,
    marginTop: 4,
  },
  testResultsCard: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#333",
    maxHeight: 300,
  },
  testResultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  testResultsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1DB954",
  },
  testResultItem: {
    gap: 4,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#282828",
  },
  testResultTime: {
    fontSize: 10,
    color: "#666",
  },
  testResultContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  testResultMessage: {
    flex: 1,
    fontSize: 12,
    color: "#b3b3b3",
  },
  testResultError: {
    color: "#ff6666",
  },
});
