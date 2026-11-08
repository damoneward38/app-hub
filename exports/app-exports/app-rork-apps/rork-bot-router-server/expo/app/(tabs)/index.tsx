import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Animated } from "react-native";
import { Music2, Clock, Trash2, CheckCircle, Circle, WifiOff, Radio, Shield } from "lucide-react-native";
import { trpc, checkBackendHealth } from "@/lib/trpc";
import { useState, useEffect, useRef, useCallback } from "react";

export default function ReleasesScreen() {
  console.log('🏠 Releases screen rendered');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [backendUrl, setBackendUrl] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [healthCheckResults, setHealthCheckResults] = useState<{timestamp: string, ok: boolean, message: string}[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const healthCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  
  useEffect(() => {
    const url = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'NOT SET';
    setBackendUrl(url);
    console.log('🔗 Backend URL:', url);
  }, []);
  
  const releasesQuery = trpc.releases.getAll.useQuery(undefined, {
    retry: 2,
    retryDelay: 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: autoRefresh ? 5000 : 30000,
    refetchInterval: autoRefresh ? 5000 : false,
    networkMode: 'always',
  });
  
  const runHealthCheck = useCallback(async () => {
    const result = await checkBackendHealth();
    const timestamp = new Date();
    
    setHealthCheckResults(prev => [{
      timestamp: timestamp.toLocaleTimeString(),
      ok: result.ok,
      message: result.message
    }, ...prev.slice(0, 9)]);
    
    if (result.ok) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 150, useNativeDriver: true })
      ]).start();
    }
  }, [pulseAnim]);

  useEffect(() => {
    if (releasesQuery.isSuccess) {
      console.log('✅ Backend connection successful');
      setBackendStatus('online');
    } else if (releasesQuery.isError) {
      console.error('❌ Backend connection failed:', releasesQuery.error?.message);
      setBackendStatus('offline');
    }
  }, [releasesQuery.isSuccess, releasesQuery.isError, releasesQuery.error]);

  useEffect(() => {
    runHealthCheck();
    
    if (autoRefresh) {
      healthCheckInterval.current = setInterval(() => {
        console.log('🔄 Auto health check triggered');
        runHealthCheck();
      }, 10000);
    }

    return () => {
      if (healthCheckInterval.current) {
        clearInterval(healthCheckInterval.current);
      }
    };
  }, [autoRefresh, runHealthCheck]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  console.log('📊 Releases screen - Query status:', releasesQuery.status);
  console.log('📊 Releases count:', releasesQuery.data?.length || 0);
  console.log('📊 Is Loading:', releasesQuery.isLoading);
  console.log('📊 Is Error:', releasesQuery.isError);
  console.log('📊 Is Success:', releasesQuery.isSuccess);
  if (releasesQuery.error) {
    console.log('❌ Query error:', releasesQuery.error.message);
  }
  const clearMutation = trpc.releases.clear.useMutation({
    onSuccess: () => {
      releasesQuery.refetch();
    },
  });

  const deleteMutation = trpc.releases.delete.useMutation({
    onSuccess: () => {
      console.log('✅ Release deleted');
      releasesQuery.refetch();
    },
    onError: (error) => {
      console.error('❌ Delete failed:', error.message);
    },
  });

  const releases = releasesQuery.data || [];

  if (releasesQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Loading releases...</Text>
      </View>
    );
  }

  if (releasesQuery.isError) {
    const errorMessage = releasesQuery.error?.message || 'Unknown error';
    const isNetworkError = errorMessage.includes('NETWORK_') || errorMessage.includes('CONNECTION_') || errorMessage.includes('TIMEOUT') || errorMessage.includes('BACKEND_NOT_RUNNING');
    const isBackendError = errorMessage.includes('BACKEND_ERROR_');
    
    return (
      <View style={styles.errorContainer}>
        <WifiOff size={80} color="#ff4444" />
        <Text style={styles.errorTitle}>⚠️ Connection Failed</Text>
        <Text style={styles.errorSubtitle}>
          {isNetworkError ? 'Backend Server Offline' : isBackendError ? 'Backend Error' : 'Connection Error'}
        </Text>
        
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Backend URL:</Text>
            <Text style={styles.statusValue} numberOfLines={2}>{backendUrl}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Error Type:</Text>
            <Text style={styles.statusError}>
              {isNetworkError ? '🔴 Network Failure' : isBackendError ? '⚠️ Server Error' : '❓ Unknown'}
            </Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Details:</Text>
          </View>
          <Text style={styles.statusError}>{errorMessage}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.statusHint}>
            💡 The backend server at the URL above must be running and accessible for the app to work.
            {isNetworkError && '\n\n🔧 Check: Server deployment, network connectivity, and CORS settings.'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            const now = new Date().toISOString();
            console.log(`[${now}] 🔄 Manual retry initiated`);
            setBackendStatus('checking');
            releasesQuery.refetch();
          }}
          disabled={releasesQuery.isRefetching}
        >
          {releasesQuery.isRefetching ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.retryButtonText}>Testing Connection...</Text>
            </>
          ) : (
            <Text style={styles.retryButtonText}>🔄 Retry Connection</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.timestamp}>
          Last attempt: {new Date().toLocaleTimeString()}
        </Text>
      </View>
    );
  }

  const handleClear = () => {
    if (releases.length > 0) {
      clearMutation.mutate();
    }
  };

  return (
    <View style={styles.container}>
      {backendStatus === 'online' && (
        <Animated.View style={[styles.statusBanner, { transform: [{ scale: pulseAnim }] }]}>
          <Radio size={14} color="#1DB954" />
          <Text style={styles.statusBannerText}>Live • Connected</Text>
          <TouchableOpacity 
            style={[styles.autoRefreshBadge, autoRefresh && styles.autoRefreshBadgeActive]}
            onPress={toggleAutoRefresh}
          >
            <Text style={[styles.autoRefreshBadgeText, autoRefresh && styles.autoRefreshBadgeTextActive]}>
              {autoRefresh ? 'Auto ✓' : 'Manual'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      {releases.length === 0 ? (
        <View style={styles.emptyState}>
          <Shield size={64} color="#1DB954" />
          <Text style={styles.emptyTitle}>System Ready</Text>
          <Text style={styles.emptyText}>Backend connected and monitoring</Text>
          {healthCheckResults.length > 0 && (
            <View style={styles.healthCheckCard}>
              <Text style={styles.healthCheckTitle}>🔍 Health Checks</Text>
              {healthCheckResults.slice(0, 5).map((result, idx) => (
                <View key={idx} style={styles.healthCheckItem}>
                  <Text style={styles.healthCheckTime}>{result.timestamp}</Text>
                  <View style={styles.healthCheckContent}>
                    {result.ok ? (
                      <CheckCircle size={12} color="#1DB954" />
                    ) : (
                      <WifiOff size={12} color="#ff4444" />
                    )}
                    <Text style={[styles.healthCheckMessage, !result.ok && styles.healthCheckError]}>
                      {result.message}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.emptyText}>Add your first music release using the + tab</Text>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerText}>{releases.length} Release{releases.length !== 1 ? 's' : ''}</Text>
            <TouchableOpacity 
              style={styles.clearButton} 
              onPress={handleClear}
              disabled={clearMutation.isPending}
            >
              <Trash2 size={20} color="#ff4444" />
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={releases}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={releasesQuery.isRefetching}
                onRefresh={() => releasesQuery.refetch()}
                tintColor="#1DB954"
              />
            }
            renderItem={({ item }) => (
              <View style={styles.releaseCard}>
                <View style={styles.iconContainer}>
                  <Music2 size={32} color="#1DB954" />
                </View>
                <View style={styles.releaseInfo}>
                  <Text style={styles.trackName}>{item.track}</Text>
                  <Text style={styles.artistName}>{item.artist}</Text>
                  <View style={styles.timestampContainer}>
                    <Clock size={14} color="#666" />
                    <Text style={styles.timestamp}>{item.timestamp}</Text>
                  </View>
                  
                  {item.botStatuses && item.botStatuses.length > 0 && (
                    <View style={styles.botsSection}>
                      <View style={styles.botsSectionHeader}>
                        <Text style={styles.botsSectionTitle}>Bot Status</Text>
                        <Text style={styles.botsProgress}>
                          {item.botStatuses.filter(b => b.completed).length}/{item.botStatuses.length}
                        </Text>
                      </View>
                      <View style={styles.botsList}>
                        {item.botStatuses.map((bot, index) => (
                          <View key={index} style={styles.botItem}>
                            {bot.completed ? (
                              <CheckCircle size={16} color="#1DB954" />
                            ) : (
                              <Circle size={16} color="#666" />
                            )}
                            <Text style={styles.botIcon}>{bot.icon}</Text>
                            <View style={styles.botInfo}>
                              <Text style={[styles.botName, bot.completed && styles.botNameCompleted]}>
                                {bot.name}
                              </Text>
                              {bot.attempts && bot.attempts > 1 && (
                                <Text style={styles.botAttempts}>
                                  ({bot.attempts} attempts)
                                </Text>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    console.log('🗑️ Deleting release:', item.id);
                    deleteMutation.mutate({ id: item.id });
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 size={18} color="#ff4444" />
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#282828",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
  },
  clearButtonText: {
    color: "#ff4444",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#999",
    lineHeight: 24,
  },
  listContent: {
    padding: 16,
  },
  releaseCard: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#282828",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "rgba(29, 185, 84, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  releaseInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  trackName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  artistName: {
    fontSize: 16,
    color: "#b3b3b3",
    marginBottom: 6,
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timestamp: {
    fontSize: 13,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    color: "#ff4444",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  errorText: {
    color: "#999",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "#1DB954",
    borderRadius: 24,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  errorSubtitle: {
    fontSize: 18,
    color: "#ff6666",
    textAlign: "center",
    marginTop: 8,
  },
  statusCard: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 24,
    gap: 16,
    borderWidth: 2,
    borderColor: "#ff4444",
    marginVertical: 20,
  },
  statusRow: {
    gap: 8,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  statusValue: {
    fontSize: 13,
    color: "#1DB954",
    fontFamily: "monospace" as const,
    paddingVertical: 4,
  },
  statusError: {
    fontSize: 13,
    color: "#ff8888",
    lineHeight: 20,
  },
  statusHint: {
    fontSize: 13,
    color: "#888",
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    backgroundColor: "rgba(29, 185, 84, 0.15)",
    borderBottomWidth: 2,
    borderBottomColor: "#1DB954",
  },
  autoRefreshBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "#666",
    marginLeft: 4,
  },
  autoRefreshBadgeActive: {
    backgroundColor: "#1DB954",
    borderColor: "#1DB954",
  },
  autoRefreshBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#999",
  },
  autoRefreshBadgeTextActive: {
    color: "#000",
  },
  statusBannerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1DB954",
  },
  botsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#282828",
  },
  botsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  botsSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1DB954",
  },
  botsProgress: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
    backgroundColor: "#282828",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  botsList: {
    gap: 6,
  },
  botItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  botIcon: {
    fontSize: 14,
  },
  botInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  botName: {
    fontSize: 13,
    color: "#666",
  },
  botNameCompleted: {
    color: "#1DB954",
  },
  botAttempts: {
    fontSize: 11,
    color: "#666",
    fontStyle: "italic" as const,
  },
  healthCheckCard: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#1DB954",
    marginVertical: 16,
  },
  healthCheckTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1DB954",
    marginBottom: 8,
  },
  healthCheckItem: {
    gap: 4,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#282828",
  },
  healthCheckTime: {
    fontSize: 10,
    color: "#666",
  },
  healthCheckContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  healthCheckMessage: {
    flex: 1,
    fontSize: 12,
    color: "#b3b3b3",
  },
  healthCheckError: {
    color: "#ff6666",
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
});
