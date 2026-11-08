import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { useState, useEffect } from "react";
import { trpc, setCustomBackendUrl } from "@/lib/trpc";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckCircle, XCircle, PlayCircle, Search, BarChart3, Database, Activity, MessageCircle, Zap, Settings, RefreshCw } from "lucide-react-native";

export default function TestAPIScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<'all' | 'artist' | 'track'>('all');
  const [releaseId, setReleaseId] = useState("");
  const [echoMessage, setEchoMessage] = useState("");
  const [testResults, setTestResults] = useState<{[key: string]: { success: boolean; time: number; data?: any; error?: string }}>({});
  const [customUrl, setCustomUrl] = useState("");
  const [currentBackendUrl, setCurrentBackendUrl] = useState("");
  const [isUrlSaving, setIsUrlSaving] = useState(false);

  useEffect(() => {
    loadCurrentUrl();
  }, []);

  const loadCurrentUrl = async () => {
    const stored = await AsyncStorage.getItem('@custom_backend_url');
    if (stored) {
      setCustomUrl(stored);
      setCurrentBackendUrl(stored);
    } else {
      setCurrentBackendUrl('Using default (Railway)');
    }
  };

  const handleSaveUrl = async () => {
    if (!customUrl.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }
    
    setIsUrlSaving(true);
    try {
      await setCustomBackendUrl(customUrl.trim());
      setCurrentBackendUrl(customUrl.trim());
      Alert.alert('Success', 'Backend URL saved! Pull down to refresh the app.', [
        { text: 'OK', onPress: () => {} }
      ]);
    } catch {
      Alert.alert('Error', 'Failed to save URL');
    } finally {
      setIsUrlSaving(false);
    }
  };

  const handleResetUrl = async () => {
    Alert.alert(
      'Reset to Default',
      'Use Railway backend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: async () => {
            setIsUrlSaving(true);
            try {
              await setCustomBackendUrl(null);
              setCustomUrl('');
              setCurrentBackendUrl('Using default (Railway)');
              Alert.alert('Success', 'Reset to default! Pull down to refresh.');
            } catch {
              Alert.alert('Error', 'Failed to reset URL');
            } finally {
              setIsUrlSaving(false);
            }
          }
        }
      ]
    );
  };

  const demoQuery = trpc.releases.demo.useQuery(undefined, { enabled: false });
  const healthQuery = trpc.releases.health.useQuery(undefined, { enabled: false });
  const statsQuery = trpc.releases.getStats.useQuery(undefined, { enabled: false });
  const getAllQuery = trpc.releases.getAll.useQuery(undefined, { enabled: false });
  const getByIdQuery = trpc.releases.getById.useQuery({ id: releaseId }, { enabled: false });
  const searchQuery2 = trpc.releases.search.useQuery({ query: searchQuery, field: searchField }, { enabled: false });
  const echoMutation = trpc.releases.echo.useMutation();

  const runTest = async (testName: string, queryFn: () => Promise<any>) => {
    const startTime = Date.now();
    try {
      const result = await queryFn();
      const time = Date.now() - startTime;
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, time, data: result }
      }));
    } catch (error: any) {
      const time = Date.now() - startTime;
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, time, error: error.message }
      }));
    }
  };

  const tests = [
    {
      id: 'demo',
      name: 'Demo Endpoint',
      description: 'Simple hello world endpoint',
      icon: Zap,
      color: '#FFD700',
      run: () => runTest('demo', () => demoQuery.refetch().then(r => r.data)),
      result: testResults['demo'],
      loading: demoQuery.isFetching,
    },
    {
      id: 'health',
      name: 'Health Check',
      description: 'Check API health and status',
      icon: Activity,
      color: '#00D9FF',
      run: () => runTest('health', () => healthQuery.refetch().then(r => r.data)),
      result: testResults['health'],
      loading: healthQuery.isFetching,
    },
    {
      id: 'getAll',
      name: 'Get All Releases',
      description: 'Fetch all releases from database',
      icon: Database,
      color: '#1DB954',
      run: () => runTest('getAll', () => getAllQuery.refetch().then(r => r.data)),
      result: testResults['getAll'],
      loading: getAllQuery.isFetching,
    },
    {
      id: 'stats',
      name: 'Get Statistics',
      description: 'Get aggregate statistics',
      icon: BarChart3,
      color: '#FF6B00',
      run: () => runTest('stats', () => statsQuery.refetch().then(r => r.data)),
      result: testResults['stats'],
      loading: statsQuery.isFetching,
    },
  ];

  const runAllTests = async () => {
    for (const test of tests) {
      await test.run();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>API Testing Dashboard</Text>
        <Text style={styles.subtitle}>Test all tRPC endpoints</Text>
      </View>

      <View style={styles.configSection}>
        <View style={styles.configHeader}>
          <Settings size={20} color="#FFD700" />
          <Text style={styles.configTitle}>Backend Configuration</Text>
        </View>
        
        <View style={styles.currentUrlContainer}>
          <Text style={styles.currentUrlLabel}>Current:</Text>
          <Text style={styles.currentUrlText}>{currentBackendUrl}</Text>
        </View>

        <TextInput
          style={styles.urlInput}
          placeholder="Enter IP:PORT (e.g., 192.168.1.153:3000)"
          placeholderTextColor="#666"
          value={customUrl}
          onChangeText={setCustomUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          editable={!isUrlSaving}
        />
        
        <View style={styles.configButtons}>
          <TouchableOpacity
            style={[styles.configButton, styles.saveButton]}
            onPress={handleSaveUrl}
            disabled={isUrlSaving || !customUrl.trim()}
          >
            {isUrlSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <CheckCircle size={16} color="#fff" />
                <Text style={styles.configButtonText}>Save URL</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.configButton, styles.resetButton]}
            onPress={handleResetUrl}
            disabled={isUrlSaving}
          >
            <RefreshCw size={16} color="#fff" />
            <Text style={styles.configButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.configHint}>💡 Tip: Run &quot;bun server.ts&quot; in your project folder, then enter your local IP and port above.</Text>
      </View>

      <TouchableOpacity 
        style={styles.runAllButton}
        onPress={runAllTests}
        disabled={tests.some(t => t.loading)}
      >
        <PlayCircle size={20} color="#fff" />
        <Text style={styles.runAllButtonText}>Run All Tests</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Endpoints</Text>
        {tests.map(test => (
          <View key={test.id} style={styles.testCard}>
            <View style={styles.testHeader}>
              <View style={[styles.iconContainer, { backgroundColor: `${test.color}15` }]}>
                <test.icon size={24} color={test.color} />
              </View>
              <View style={styles.testInfo}>
                <Text style={styles.testName}>{test.name}</Text>
                <Text style={styles.testDescription}>{test.description}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.testButton, test.loading && styles.testButtonDisabled]}
              onPress={test.run}
              disabled={test.loading}
            >
              {test.loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <PlayCircle size={16} color="#fff" />
                  <Text style={styles.testButtonText}>Test</Text>
                </>
              )}
            </TouchableOpacity>

            {test.result && (
              <View style={[styles.resultCard, test.result.success ? styles.resultSuccess : styles.resultError]}>
                <View style={styles.resultHeader}>
                  {test.result.success ? (
                    <CheckCircle size={16} color="#1DB954" />
                  ) : (
                    <XCircle size={16} color="#ff4444" />
                  )}
                  <Text style={[styles.resultStatus, test.result.success ? styles.resultStatusSuccess : styles.resultStatusError]}>
                    {test.result.success ? 'SUCCESS' : 'FAILED'}
                  </Text>
                  <Text style={styles.resultTime}>{test.result.time}ms</Text>
                </View>
                {test.result.data && (
                  <View style={styles.resultData}>
                    <Text style={styles.resultDataLabel}>Response:</Text>
                    <ScrollView horizontal style={styles.resultDataScroll}>
                      <Text style={styles.resultDataText}>{JSON.stringify(test.result.data, null, 2)}</Text>
                    </ScrollView>
                  </View>
                )}
                {test.result.error && (
                  <View style={styles.resultError}>
                    <Text style={styles.resultErrorText}>{test.result.error}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Echo Mutation</Text>
        <View style={styles.testCard}>
          <View style={styles.testHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#FF1D8E15' }]}>
              <MessageCircle size={24} color="#FF1D8E" />
            </View>
            <View style={styles.testInfo}>
              <Text style={styles.testName}>Echo Message</Text>
              <Text style={styles.testDescription}>Send a message and get it back in uppercase</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Enter a message..."
              placeholderTextColor="#666"
              value={echoMessage}
              onChangeText={setEchoMessage}
            />
          </View>

          <TouchableOpacity
            style={[styles.testButton, (echoMutation.isPending || !echoMessage) && styles.testButtonDisabled]}
            onPress={async () => {
              const startTime = Date.now();
              try {
                const result = await echoMutation.mutateAsync({ message: echoMessage });
                const time = Date.now() - startTime;
                setTestResults(prev => ({
                  ...prev,
                  echo: { success: true, time, data: result }
                }));
              } catch (error: any) {
                const time = Date.now() - startTime;
                setTestResults(prev => ({
                  ...prev,
                  echo: { success: false, time, error: error.message }
                }));
              }
            }}
            disabled={echoMutation.isPending || !echoMessage}
          >
            {echoMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MessageCircle size={16} color="#fff" />
                <Text style={styles.testButtonText}>Send</Text>
              </>
            )}
          </TouchableOpacity>

          {testResults['echo'] && (
            <View style={[styles.resultCard, testResults['echo'].success ? styles.resultSuccess : styles.resultError]}>
              <View style={styles.resultHeader}>
                {testResults['echo'].success ? (
                  <CheckCircle size={16} color="#1DB954" />
                ) : (
                  <XCircle size={16} color="#ff4444" />
                )}
                <Text style={[styles.resultStatus, testResults['echo'].success ? styles.resultStatusSuccess : styles.resultStatusError]}>
                  {testResults['echo'].success ? 'SUCCESS' : 'FAILED'}
                </Text>
                <Text style={styles.resultTime}>{testResults['echo'].time}ms</Text>
              </View>
              {testResults['echo'].data && (
                <View style={styles.resultData}>
                  <Text style={styles.resultDataLabel}>Response:</Text>
                  <ScrollView horizontal style={styles.resultDataScroll}>
                    <Text style={styles.resultDataText}>{JSON.stringify(testResults['echo'].data, null, 2)}</Text>
                  </ScrollView>
                </View>
              )}
              {testResults['echo'].error && (
                <View style={styles.resultError}>
                  <Text style={styles.resultErrorText}>{testResults['echo'].error}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Search Endpoint</Text>
        <View style={styles.testCard}>
          <View style={styles.testHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#9B59B615' }]}>
              <Search size={24} color="#9B59B6" />
            </View>
            <View style={styles.testInfo}>
              <Text style={styles.testName}>Search Releases</Text>
              <Text style={styles.testDescription}>Search by artist or track name</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Enter search query..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={styles.radioGroup}>
              {(['all', 'artist', 'track'] as const).map(field => (
                <TouchableOpacity
                  key={field}
                  style={[styles.radioButton, searchField === field && styles.radioButtonActive]}
                  onPress={() => setSearchField(field)}
                >
                  <Text style={[styles.radioButtonText, searchField === field && styles.radioButtonTextActive]}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.testButton, (searchQuery2.isFetching || !searchQuery) && styles.testButtonDisabled]}
            onPress={() => runTest('search', () => searchQuery2.refetch().then(r => r.data))}
            disabled={searchQuery2.isFetching || !searchQuery}
          >
            {searchQuery2.isFetching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Search size={16} color="#fff" />
                <Text style={styles.testButtonText}>Search</Text>
              </>
            )}
          </TouchableOpacity>

          {testResults['search'] && (
            <View style={[styles.resultCard, testResults['search'].success ? styles.resultSuccess : styles.resultError]}>
              <View style={styles.resultHeader}>
                {testResults['search'].success ? (
                  <CheckCircle size={16} color="#1DB954" />
                ) : (
                  <XCircle size={16} color="#ff4444" />
                )}
                <Text style={[styles.resultStatus, testResults['search'].success ? styles.resultStatusSuccess : styles.resultStatusError]}>
                  {testResults['search'].success ? 'SUCCESS' : 'FAILED'}
                </Text>
                <Text style={styles.resultTime}>{testResults['search'].time}ms</Text>
              </View>
              {testResults['search'].data && (
                <View style={styles.resultData}>
                  <Text style={styles.resultDataLabel}>Found {testResults['search'].data.length} results</Text>
                  <ScrollView horizontal style={styles.resultDataScroll}>
                    <Text style={styles.resultDataText}>{JSON.stringify(testResults['search'].data, null, 2)}</Text>
                  </ScrollView>
                </View>
              )}
              {testResults['search'].error && (
                <View style={styles.resultError}>
                  <Text style={styles.resultErrorText}>{testResults['search'].error}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Get By ID Endpoint</Text>
        <View style={styles.testCard}>
          <View style={styles.testHeader}>
            <View style={[styles.iconContainer, { backgroundColor: '#3498db15' }]}>
              <Database size={24} color="#3498db" />
            </View>
            <View style={styles.testInfo}>
              <Text style={styles.testName}>Get Release By ID</Text>
              <Text style={styles.testDescription}>Fetch a specific release</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Enter release ID..."
              placeholderTextColor="#666"
              value={releaseId}
              onChangeText={setReleaseId}
            />
          </View>

          <TouchableOpacity
            style={[styles.testButton, (getByIdQuery.isFetching || !releaseId) && styles.testButtonDisabled]}
            onPress={() => runTest('getById', () => getByIdQuery.refetch().then(r => r.data))}
            disabled={getByIdQuery.isFetching || !releaseId}
          >
            {getByIdQuery.isFetching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <PlayCircle size={16} color="#fff" />
                <Text style={styles.testButtonText}>Test</Text>
              </>
            )}
          </TouchableOpacity>

          {testResults['getById'] && (
            <View style={[styles.resultCard, testResults['getById'].success ? styles.resultSuccess : styles.resultError]}>
              <View style={styles.resultHeader}>
                {testResults['getById'].success ? (
                  <CheckCircle size={16} color="#1DB954" />
                ) : (
                  <XCircle size={16} color="#ff4444" />
                )}
                <Text style={[styles.resultStatus, testResults['getById'].success ? styles.resultStatusSuccess : styles.resultStatusError]}>
                  {testResults['getById'].success ? 'SUCCESS' : 'FAILED'}
                </Text>
                <Text style={styles.resultTime}>{testResults['getById'].time}ms</Text>
              </View>
              {testResults['getById'].data && (
                <View style={styles.resultData}>
                  <Text style={styles.resultDataLabel}>Response:</Text>
                  <ScrollView horizontal style={styles.resultDataScroll}>
                    <Text style={styles.resultDataText}>{JSON.stringify(testResults['getById'].data, null, 2)}</Text>
                  </ScrollView>
                </View>
              )}
              {testResults['getById'].error && (
                <View style={styles.resultError}>
                  <Text style={styles.resultErrorText}>{testResults['getById'].error}</Text>
                </View>
              )}
            </View>
          )}
        </View>
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
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
  },
  runAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1DB954",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  runAllButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700" as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 12,
  },
  testCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#282828",
  },
  testHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  testInfo: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
    marginBottom: 2,
  },
  testDescription: {
    fontSize: 13,
    color: "#999",
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1DB954",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  testButtonDisabled: {
    opacity: 0.5,
  },
  testButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  resultCard: {
    marginTop: 12,
    borderRadius: 8,
    padding: 12,
    borderWidth: 2,
  },
  resultSuccess: {
    backgroundColor: "rgba(29, 185, 84, 0.1)",
    borderColor: "#1DB954",
  },
  resultError: {
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    borderColor: "#ff4444",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: "700" as const,
  },
  resultStatusSuccess: {
    color: "#1DB954",
  },
  resultStatusError: {
    color: "#ff4444",
  },
  resultTime: {
    fontSize: 12,
    color: "#999",
    marginLeft: "auto",
  },
  resultData: {
    gap: 4,
  },
  resultDataLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#1DB954",
    marginBottom: 4,
  },
  resultDataScroll: {
    maxHeight: 200,
  },
  resultDataText: {
    fontSize: 11,
    color: "#b3b3b3",
    fontFamily: "monospace" as const,
  },
  resultErrorText: {
    fontSize: 12,
    color: "#ff8888",
    lineHeight: 18,
  },
  inputGroup: {
    gap: 8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#282828",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
  },
  radioGroup: {
    flexDirection: "row",
    gap: 8,
  },
  radioButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#282828",
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
  },
  radioButtonActive: {
    backgroundColor: "#1DB954",
    borderColor: "#1DB954",
  },
  radioButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#999",
  },
  radioButtonTextActive: {
    color: "#000",
  },
  configSection: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  configHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#FFD700",
  },
  currentUrlContainer: {
    backgroundColor: "#282828",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  currentUrlLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 4,
    fontWeight: "600" as const,
  },
  currentUrlText: {
    fontSize: 13,
    color: "#fff",
    fontFamily: "monospace" as const,
  },
  urlInput: {
    backgroundColor: "#282828",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#fff",
    borderWidth: 2,
    borderColor: "#FFD700",
    marginBottom: 12,
    fontFamily: "monospace" as const,
  },
  configButtons: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  configButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: "#1DB954",
  },
  resetButton: {
    backgroundColor: "#ff4444",
  },
  configButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  configHint: {
    fontSize: 12,
    color: "#999",
    lineHeight: 18,
  },
});
