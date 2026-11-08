import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Send, ArrowLeft, Mic, Square, AudioLines, Volume2, VolumeX, Trash2 } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { AndroidAudioEncoder, AndroidOutputFormat, IOSAudioQuality, IOSOutputFormat } from 'expo-av/build/Audio/RecordingConstants';
import { useRorkAgent } from '@rork-ai/toolkit-sdk';
import Colors from '@/constants/colors';
import { getBotById } from '@/mocks/bots';
import {
  appendChatHistory,
  clearChatHistory,
  loadChatHistory,
  type ChatHistoryEntry,
} from '@/utils/chatHistory';

interface MessagePart {
  type: 'text' | 'tool';
  text?: string;
  toolName?: string;
  state?: string;
  output?: unknown;
  errorText?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  parts: MessagePart[];
}

type RecordingState = 'idle' | 'recording' | 'transcribing';

type NativeAudioFile = {
  uri: string;
  name: string;
  type: string;
};

type BrowserSpeechRecognitionAlternative = {
  transcript: string;
};

type BrowserSpeechRecognitionResult = {
  isFinal: boolean;
  0: BrowserSpeechRecognitionAlternative;
};

type BrowserSpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: BrowserSpeechRecognitionResult;
  };
};

type BrowserSpeechRecognitionErrorEvent = {
  error: string;
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type TranscribeInput =
  | {
      kind: 'web';
      blob: Blob;
      mimeType: string;
      fileName: string;
    }
  | {
      kind: 'native';
      uri: string;
      mimeType: string;
      fileName: string;
    };

interface TranscribeResponse {
  text: string;
  language: string;
}

const RECORDING_PULSE_SCALE = 1.08;
const RECORDING_BUTTON_IDLE_SIZE = 44;
const WEB_SPEECH_LANGUAGE = 'en-US';
const MAX_SPEECH_LENGTH = 4000;

const MIC_BLOCKED_MESSAGE =
  'Microphone access is blocked in this preview. Allow the mic in your browser settings, or open the app in a new tab and try again.';

/**
 * Detects permission/security denials from getUserMedia or the permissions API.
 * These need a different recovery path (user action in browser) than a retry.
 */
const isMicPermissionError = (error: unknown): boolean => {
  if (typeof error === 'object' && error !== null && 'name' in error) {
    const name = String((error as { name?: unknown }).name ?? '');
    return name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError';
  }
  return false;
};

const createMicPermissionError = (): Error => {
  const error = new Error('Microphone permission is denied or blocked.');
  error.name = 'NotAllowedError';
  return error;
};

/** Queries the browser mic permission without triggering a getUserMedia prompt. */
const queryMicPermissionState = async (): Promise<PermissionState | null> => {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !navigator.permissions?.query) {
    return null;
  }

  try {
    const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
    return status.state;
  } catch {
    return null;
  }
};

/** True when the app runs inside an embedded preview iframe (mic usually blocked there). */
const isEmbeddedInIframe = (): boolean => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }

  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};


export default function BotChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const bot = getBotById(id || '');
  const [input, setInput] = useState<string>('');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isMicBlocked, setIsMicBlocked] = useState<boolean>(false);
  const [standaloneUrl, setStandaloneUrl] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const webScrollFrameRef = useRef<number | null>(null);
  const nativeRecordingRef = useRef<Audio.Recording | null>(null);
  const webRecorderRef = useRef<MediaRecorder | null>(null);
  const webStreamRef = useRef<MediaStream | null>(null);
  const webChunksRef = useRef<Blob[]>([]);
  const webSpeechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatHistoryEntry[]>([]);
  const savedEntriesRef = useRef<Map<string, ChatHistoryEntry>>(new Map());
  const messagesRef = useRef<Message[]>([]);
  const persistRef = useRef<() => void>(() => {});
  const webSpeechTranscriptRef = useRef<string>('');
  const webSpeechHeardVoiceRef = useRef<boolean>(false);
  const webSpeechManualStopRef = useRef<boolean>(false);
  const webSpeechIgnoreAbortErrorRef = useRef<boolean>(false);
  const recordingPulse = useRef<Animated.Value>(new Animated.Value(1)).current;

  const { messages, error, sendMessage, status } = useRorkAgent({
    tools: {},
  });

  const transcribeMutation = useMutation<TranscribeResponse, Error, TranscribeInput>({
    mutationFn: async (audioInput) => {
      const toolkitUrl = process.env.EXPO_PUBLIC_TOOLKIT_URL;

      if (!toolkitUrl) {
        console.error('Speech transcription failed: missing EXPO_PUBLIC_TOOLKIT_URL');
        throw new Error('Voice input is not configured right now.');
      }

      console.log('Uploading audio for speech transcription', {
        kind: audioInput.kind,
        fileName: audioInput.fileName,
        mimeType: audioInput.mimeType,
      });

      const formData = new FormData();
      formData.append('language', 'auto');

      if (audioInput.kind === 'web') {
        formData.append('audio', audioInput.blob, audioInput.fileName);
      } else {
        const nativeFile: NativeAudioFile = {
          uri: audioInput.uri,
          name: audioInput.fileName,
          type: audioInput.mimeType,
        };
        formData.append('audio', nativeFile as unknown as Blob);
      }

      const response = await fetch(new URL('/stt/transcribe/', toolkitUrl).toString(), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error('Speech transcription request failed', {
          status: response.status,
          responseText,
        });
        throw new Error('Could not turn your voice into text.');
      }

      const data = (await response.json()) as TranscribeResponse;
      console.log('Speech transcription complete', {
        language: data.language,
        textLength: data.text.length,
      });
      return data;
    },
    onMutate: () => {
      setRecordingError(null);
      setRecordingState('transcribing');
    },
    onSuccess: async (data) => {
      const transcript = data.text.trim();
      await applyTranscript(transcript);
    },
    onError: async (mutationError) => {
      console.error('Speech transcription error', mutationError);
      setRecordingError(mutationError.message || 'Voice input failed. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
    onSettled: () => {
      setRecordingState('idle');
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';
  const isRecording = recordingState === 'recording';
  const isTranscribing = recordingState === 'transcribing' || transcribeMutation.isPending;

  const scrollToLatestMessage = useCallback(() => {
    if (!flatListRef.current || messages.length === 0) {
      return;
    }

    if (Platform.OS === 'web') {
      if (webScrollFrameRef.current !== null) {
        cancelAnimationFrame(webScrollFrameRef.current);
      }

      webScrollFrameRef.current = requestAnimationFrame(() => {
        try {
          flatListRef.current?.scrollToEnd({ animated: false });
        } catch {
          console.log('Scroll to end skipped');
        }
        webScrollFrameRef.current = null;
      });
      return;
    }

    flatListRef.current.scrollToEnd({ animated: true });
  }, [messages.length]);

  useEffect(() => {
    scrollToLatestMessage();
  }, [scrollToLatestMessage]);

  useEffect(() => {
    messagesRef.current = messages as Message[];
  }, [messages]);

  useEffect(() => {
    if (!bot) {
      return;
    }

    let cancelled = false;

    loadChatHistory(bot.id)
      .then((entries) => {
        if (cancelled) {
          return;
        }
        for (const entry of entries) {
          savedEntriesRef.current.set(entry.id, entry);
        }
        setHistory(entries);
      })
      .catch((loadError) => {
        console.log('Failed to load chat history', loadError);
      });

    return () => {
      cancelled = true;
    };
  }, [bot]);

  useEffect(() => {
    if (recordingState === 'recording') {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(recordingPulse, {
            toValue: RECORDING_PULSE_SCALE,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(recordingPulse, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );

      pulseAnimation.start();

      return () => {
        pulseAnimation.stop();
        recordingPulse.setValue(1);
      };
    }

    recordingPulse.setValue(1);
    return undefined;
  }, [recordingPulse, recordingState]);

  useEffect(() => {
    return () => {
      void Speech.stop();
      console.log('Cleaning up voice recording resources');
      const activeNativeRecording = nativeRecordingRef.current;
      if (activeNativeRecording) {
        activeNativeRecording.stopAndUnloadAsync().catch((stopError) => {
          console.log('Native recording cleanup skipped', stopError);
        });
        nativeRecordingRef.current = null;
      }
      webRecorderRef.current = null;
      webChunksRef.current = [];
      webSpeechIgnoreAbortErrorRef.current = true;
      webSpeechRecognitionRef.current?.abort();
      webSpeechRecognitionRef.current = null;
      webSpeechTranscriptRef.current = '';
      webSpeechHeardVoiceRef.current = false;
      webSpeechManualStopRef.current = false;
      if (webScrollFrameRef.current !== null) {
        cancelAnimationFrame(webScrollFrameRef.current);
        webScrollFrameRef.current = null;
      }
      webStreamRef.current?.getTracks().forEach((track) => track.stop());
      webStreamRef.current = null;
    };
  }, []);

  if (!bot) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Bot not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const applyTranscript = async (rawTranscript: string) => {
    const transcript = rawTranscript.trim();
    console.log('Applying transcript to chat input', { transcript });

    if (!transcript) {
      setRecordingError('I couldn’t hear anything. Speak a little louder and try again.');
      setRecordingState('idle');
      return;
    }

    setInput((currentInput) => {
      const trimmedInput = currentInput.trim();
      return trimmedInput ? `${trimmedInput} ${transcript}` : transcript;
    });
    setRecordingError(null);
    setRecordingState('idle');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSend = () => {
    if (!input.trim() || isLoading || isRecording || isTranscribing) {
      return;
    }

    const message = input.trim();
    console.log('Sending chat message', { botId: bot.id, message });
    setInput('');
    sendMessage(message);
  };

  const startWebSpeechRecognition = async () => {
    const recognitionSource = globalThis as typeof globalThis & {
      webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
      SpeechRecognition?: BrowserSpeechRecognitionConstructor;
    };
    const SpeechRecognitionConstructor =
      recognitionSource.SpeechRecognition ?? recognitionSource.webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      throw new Error('Speech recognition is not available in this browser.');
    }

    const micPermissionState = await queryMicPermissionState();
    if (micPermissionState === 'denied') {
      console.log('Microphone permission denied before starting web speech recognition');
      throw createMicPermissionError();
    }

    // Probe the mic directly: in the embedded preview iframe this fails fast with
    // NotAllowedError, so we show guidance instead of a speech-recognition error.
    if (navigator.mediaDevices?.getUserMedia) {
      const probeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      probeStream.getTracks().forEach((track) => track.stop());
    }

    const recognition = new SpeechRecognitionConstructor();
    webSpeechRecognitionRef.current = recognition;
    webSpeechTranscriptRef.current = '';
    webSpeechHeardVoiceRef.current = false;
    webSpeechManualStopRef.current = false;
    webSpeechIgnoreAbortErrorRef.current = false;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = WEB_SPEECH_LANGUAGE;
    recognition.onstart = () => {
      console.log('Web speech recognition started');
      setRecordingState('recording');
    };
    recognition.onresult = (event) => {
      let finalTranscript = webSpeechTranscriptRef.current;
      let interimTranscript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const chunk = result[0]?.transcript ?? '';

        if (chunk.trim()) {
          webSpeechHeardVoiceRef.current = true;
        }

        if (result.isFinal) {
          finalTranscript = `${finalTranscript} ${chunk}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${chunk}`.trim();
        }
      }

      webSpeechTranscriptRef.current = finalTranscript || interimTranscript;
      console.log('Web speech recognition result updated', {
        finalLength: finalTranscript.length,
        interimLength: interimTranscript.length,
      });
    };
    recognition.onerror = async (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        // Expected when the mic is blocked (e.g. embedded preview iframe) — handled below
        // with the open-in-new-tab guidance, so it is not logged as an error.
        console.log('Web speech recognition blocked', event.error);
      } else {
        console.error('Web speech recognition error', event.error, {
          manualStop: webSpeechManualStopRef.current,
          ignoreAbortError: webSpeechIgnoreAbortErrorRef.current,
        });
      }
      webSpeechRecognitionRef.current = null;

      if (event.error === 'aborted') {
        if (!webSpeechManualStopRef.current && !webSpeechIgnoreAbortErrorRef.current) {
          setRecordingState('idle');
          setRecordingError('Voice input was interrupted. Please try again.');
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        return;
      }

      setRecordingState('idle');

      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsMicBlocked(true);
        setRecordingError(MIC_BLOCKED_MESSAGE);
      } else if (event.error === 'no-speech') {
        setRecordingError('I couldn’t hear anything. Speak a little louder and try again.');
      } else {
        setRecordingError('Voice input stopped unexpectedly. Please try again.');
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    };
    recognition.onend = async () => {
      console.log('Web speech recognition ended', {
        heardVoice: webSpeechHeardVoiceRef.current,
        manualStop: webSpeechManualStopRef.current,
        transcriptLength: webSpeechTranscriptRef.current.length,
      });

      webSpeechRecognitionRef.current = null;
      const finalTranscript = webSpeechTranscriptRef.current.trim();
      const shouldIgnoreAbortError = webSpeechIgnoreAbortErrorRef.current;
      webSpeechTranscriptRef.current = '';
      webSpeechIgnoreAbortErrorRef.current = false;

      if (!finalTranscript) {
        setRecordingState('idle');
        if (!shouldIgnoreAbortError && (webSpeechManualStopRef.current || webSpeechHeardVoiceRef.current)) {
          setRecordingError('I couldn’t hear anything clearly. Try again a bit closer to the mic.');
        }
        webSpeechHeardVoiceRef.current = false;
        webSpeechManualStopRef.current = false;
        return;
      }

      webSpeechHeardVoiceRef.current = false;
      webSpeechManualStopRef.current = false;
      await applyTranscript(finalTranscript);
    };

    recognition.start();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const startWebRecording = async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      console.error('Web voice input unavailable: getUserMedia is missing');
      setRecordingError('Voice input is not supported in this browser.');
      return;
    }

    if (typeof MediaRecorder === 'undefined') {
      console.error('Web voice input unavailable: MediaRecorder is missing');
      setRecordingError('Voice input is not supported in this browser.');
      return;
    }

    console.log('Requesting microphone access on web');
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const preferredMimeTypes = ['audio/webm;codecs=opus', 'audio/webm'];
    const supportedMimeType = preferredMimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
    const recorder = supportedMimeType ? new MediaRecorder(stream, { mimeType: supportedMimeType }) : new MediaRecorder(stream);

    webChunksRef.current = [];
    webStreamRef.current = stream;
    webRecorderRef.current = recorder;

    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        webChunksRef.current.push(event.data);
      }
    };

    recorder.onerror = (event: Event) => {
      console.error('Web recorder error', event);
      webStreamRef.current?.getTracks().forEach((track) => track.stop());
      webStreamRef.current = null;
      webRecorderRef.current = null;
      setRecordingState('idle');
      setRecordingError('The recording stopped unexpectedly. Please try again.');
    };

    recorder.onstop = () => {
      console.log('Web recording stopped', {
        chunks: webChunksRef.current.length,
        mimeType: recorder.mimeType,
      });

      const mimeType = recorder.mimeType || 'audio/webm';
      const blob = new Blob(webChunksRef.current, { type: mimeType });
      webStreamRef.current?.getTracks().forEach((track) => track.stop());
      webStreamRef.current = null;
      webRecorderRef.current = null;
      webChunksRef.current = [];

      transcribeMutation.mutate({
        kind: 'web',
        blob,
        mimeType,
        fileName: 'voice-note.webm',
      });
    };

    recorder.start(250);
    console.log('Web recording started');
    setRecordingState('recording');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const startNativeRecording = async () => {
    console.log('Requesting microphone access on native');
    const permissionResponse = await Audio.requestPermissionsAsync();

    if (!permissionResponse.granted) {
      console.error('Microphone permission denied on native');
      setRecordingError('Please allow microphone access to use voice input.');
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync({
      android: {
        extension: '.m4a',
        outputFormat: AndroidOutputFormat.MPEG_4,
        audioEncoder: AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.wav',
        outputFormat: IOSOutputFormat.LINEARPCM,
        audioQuality: IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {},
    });
    await recording.startAsync();
    nativeRecordingRef.current = recording;
    console.log('Native recording started');
    setRecordingState('recording');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleStartRecording = async () => {
    if (isLoading || isRecording || isTranscribing) {
      return;
    }

    try {
      setRecordingError(null);
      setIsMicBlocked(false);
      if (Platform.OS === 'web') {
        if (isEmbeddedInIframe()) {
          console.log('Voice input requested inside embedded preview iframe');
        }

        try {
          await startWebSpeechRecognition();
        } catch (speechRecognitionError) {
          if (isMicPermissionError(speechRecognitionError)) {
            // Mic is blocked at the browser/iframe level — the MediaRecorder
            // fallback would hit the same wall, so surface guidance instead.
            throw speechRecognitionError;
          }
          console.log('Web speech recognition unavailable, falling back to audio upload', speechRecognitionError);
          await startWebRecording();
        }
      } else {
        await startNativeRecording();
      }
    } catch (startError) {
      setRecordingState('idle');

      if (isMicPermissionError(startError)) {
        // Expected in the embedded preview iframe — handled with guidance, not an error.
        console.log('Microphone unavailable for voice input', {
          embeddedInIframe: isEmbeddedInIframe(),
        });
        setIsMicBlocked(true);
        setRecordingError(MIC_BLOCKED_MESSAGE);
      } else {
        console.error('Failed to start recording', startError);
        setRecordingError('Could not start recording. Please try again.');
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleStopRecording = async () => {
    if (!isRecording) {
      return;
    }

    try {
      console.log('Stopping recording');
      setRecordingError(null);
      setRecordingState('transcribing');

      if (Platform.OS === 'web') {
        if (webSpeechRecognitionRef.current) {
          webSpeechManualStopRef.current = true;
          webSpeechIgnoreAbortErrorRef.current = true;
          webSpeechRecognitionRef.current.stop();
          return;
        }

        webRecorderRef.current?.stop();
        return;
      }

      const recording = nativeRecordingRef.current;
      nativeRecordingRef.current = null;

      if (!recording) {
        throw new Error('No active recording found.');
      }

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recording.getURI();
      if (!uri) {
        throw new Error('Recording file was not created.');
      }

      const fileName = Platform.OS === 'ios' ? 'voice-note.wav' : 'voice-note.m4a';
      const mimeType = Platform.OS === 'ios' ? 'audio/wav' : 'audio/m4a';

      console.log('Native recording captured', { uri, mimeType });
      transcribeMutation.mutate({
        kind: 'native',
        uri,
        mimeType,
        fileName,
      });
    } catch (stopError) {
      console.error('Failed to stop recording', stopError);
      setRecordingState('idle');
      setRecordingError('Could not finish recording. Please try again.');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      }
    }
  };

  const handleSpeak = useCallback(async (messageId: string, text: string) => {
    if (speakingMessageId === messageId) {
      void Speech.stop();
      setSpeakingMessageId(null);
      return;
    }

    void Speech.stop();
    setSpeakingMessageId(messageId);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const safeText = text.length > MAX_SPEECH_LENGTH
      ? text.slice(0, MAX_SPEECH_LENGTH) + '...'
      : text;

    Speech.speak(safeText, {
      language: 'en-US',
      rate: 0.95,
      onDone: () => {
        console.log('TTS finished for message:', messageId);
        setSpeakingMessageId(null);
      },
      onStopped: () => {
        console.log('TTS stopped for message:', messageId);
        setSpeakingMessageId(null);
      },
      onError: (err) => {
        // Stopping playback (tap again / leave screen) makes web speechSynthesis report
        // 'interrupted'/'canceled' — that is expected, not a real failure.
        const message = typeof err === 'string' ? err : String((err as { message?: string })?.message ?? err ?? '');
        if (/cancel|interrupt/i.test(message)) {
          console.log('TTS playback stopped intentionally:', message);
        } else {
          console.error('TTS error:', err);
        }
        setSpeakingMessageId(null);
      },
    });
  }, [speakingMessageId]);

  const getMessageText = (parts: MessagePart[]): string => {
    return parts
      .filter((p) => p.type === 'text' && p.text)
      .map((p) => p.text ?? '')
      .join(' ')
      .trim();
  };

  const persistLiveMessages = useCallback(async () => {
    if (!bot) {
      return;
    }

    const updates: ChatHistoryEntry[] = [];

    for (const message of messagesRef.current) {
      const text = getMessageText(message.parts);
      if (!text) {
        continue;
      }

      const existing = savedEntriesRef.current.get(message.id);
      if (existing && existing.text === text) {
        continue;
      }

      updates.push({
        id: message.id,
        role: message.role,
        text,
        createdAt: Date.now(),
      });
    }

    if (updates.length === 0) {
      return;
    }

    for (const entry of updates) {
      savedEntriesRef.current.set(entry.id, entry);
    }

    try {
      const saved = await appendChatHistory(bot.id, updates);
      setHistory(saved);
      console.log('Auto-saved chat messages', { botId: bot.id, savedCount: updates.length });
    } catch (saveError) {
      console.log('Failed to auto-save chat messages', saveError);
    }
  }, [bot]);

  useEffect(() => {
    persistRef.current = () => {
      void persistLiveMessages();
    };
  }, [persistLiveMessages]);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const saveTimer = setTimeout(() => {
      void persistLiveMessages();
    }, 800);

    return () => clearTimeout(saveTimer);
  }, [messages, persistLiveMessages]);

  useEffect(() => {
    return () => {
      persistRef.current();
    };
  }, []);

  const visibleHistory = useMemo<ChatHistoryEntry[]>(() => {
    const liveIds = new Set<string>((messages as Message[]).map((message) => message.id));
    return history.filter((entry) => !liveIds.has(entry.id));
  }, [history, messages]);

  const handleClearHistory = useCallback(() => {
    if (!bot || visibleHistory.length === 0) {
      return;
    }

    Alert.alert(
      'Clear conversation',
      'Delete the auto-saved conversation with this bot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            savedEntriesRef.current.clear();
            setHistory([]);
            void clearChatHistory(bot.id);
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  }, [bot, visibleHistory.length]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    const fullText = getMessageText(item.parts);
    const isSpeaking = speakingMessageId === item.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={[styles.botAvatar, { backgroundColor: bot.gradient[0] }]}>
            <Text style={styles.botAvatarText}>{bot.icon}</Text>
          </View>
        )}
        <View style={{ maxWidth: '75%' }}>
          <View
            style={[
              styles.messageBubble,
              isUser ? styles.userBubble : styles.botBubble,
            ]}
          >
            {item.parts.map((part, i) => {
              if (part.type === 'text' && part.text) {
                return (
                  <Text
                    key={`${item.id}-${i}`}
                    style={[
                      styles.messageText,
                      isUser ? styles.userMessageText : styles.botMessageText,
                    ]}
                  >
                    {part.text}
                  </Text>
                );
              }
              if (part.type === 'tool') {
                return (
                  <View key={`${item.id}-${i}`} style={styles.toolIndicator}>
                    <Text style={styles.toolText}>
                      {part.state === 'output-error'
                        ? `Error: ${part.errorText}`
                        : `Processing...`}
                    </Text>
                  </View>
                );
              }
              return null;
            })}
          </View>
          {!isUser && fullText.length > 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.speakerButton,
                isSpeaking && styles.speakerButtonActive,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => handleSpeak(item.id, fullText)}
              hitSlop={8}
              testID={`speak-btn-${item.id}`}
            >
              {isSpeaking ? (
                <VolumeX size={14} color={bot.gradient[0]} />
              ) : (
                <Volume2 size={14} color={Colors.light.textSecondary} />
              )}
              <Text style={[
                styles.speakerButtonText,
                isSpeaking && { color: bot.gradient[0] },
              ]}>
                {isSpeaking ? 'Stop' : 'Listen'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const renderHistoryEntry = (entry: ChatHistoryEntry) => {
    const isUser = entry.role === 'user';
    const isSpeaking = speakingMessageId === entry.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}
      >
        {!isUser && (
          <View style={[styles.botAvatar, { backgroundColor: bot.gradient[0] }]}>
            <Text style={styles.botAvatarText}>{bot.icon}</Text>
          </View>
        )}
        <View style={{ maxWidth: '75%' }}>
          <View
            style={[
              styles.messageBubble,
              isUser ? styles.userBubble : styles.botBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userMessageText : styles.botMessageText,
              ]}
            >
              {entry.text}
            </Text>
          </View>
          {!isUser && (
            <Pressable
              style={({ pressed }) => [
                styles.speakerButton,
                isSpeaking && styles.speakerButtonActive,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => handleSpeak(entry.id, entry.text)}
              hitSlop={8}
              testID={`speak-history-btn-${entry.id}`}
            >
              {isSpeaking ? (
                <VolumeX size={14} color={bot.gradient[0]} />
              ) : (
                <Volume2 size={14} color={Colors.light.textSecondary} />
              )}
              <Text
                style={[
                  styles.speakerButtonText,
                  isSpeaking && { color: bot.gradient[0] },
                ]}
              >
                {isSpeaking ? 'Stop' : 'Listen'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const renderHistoryHeader = () => {
    if (visibleHistory.length === 0) {
      return null;
    }

    return (
      <View>
        <View style={styles.historyLabelRow}>
          <Text style={styles.historyLabelText}>
            Auto-saved conversation · {visibleHistory.length} messages
          </Text>
        </View>
        {visibleHistory.map((entry) => (
          <View key={entry.id}>{renderHistoryEntry(entry)}</View>
        ))}
      </View>
    );
  };

  const renderEmptyChat = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyAvatar, { backgroundColor: bot.gradient[0] }]}>
        <Text style={styles.emptyAvatarText}>{bot.icon}</Text>
      </View>
      <Text style={styles.emptyTitle}>Chat with {bot.name}</Text>
      <Text style={styles.emptySubtitle}>{bot.tagline}</Text>
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Try asking:</Text>
        {getSuggestions(bot.category).map((suggestion, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.suggestionChip,
              pressed && styles.suggestionPressed,
            ]}
            onPress={() => {
              setInput(suggestion);
            }}
          >
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: false,
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <Text style={styles.headerIcon}>{bot.icon}</Text>
              <Text style={styles.headerName}>{bot.name}</Text>
            </View>
          ),
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerBack}>
              <ArrowLeft size={24} color={Colors.light.text} />
            </Pressable>
          ),
          headerRight: () =>
            visibleHistory.length > 0 ? (
              <Pressable
                onPress={handleClearHistory}
                style={styles.headerBack}
                hitSlop={8}
                testID="clear-history-button"
              >
                <Trash2 size={20} color={Colors.light.error} />
              </Pressable>
            ) : null,
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'web' ? undefined : Platform.OS === 'ios' ? 'padding' : 'height'}
        enabled={Platform.OS !== 'web'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages as Message[]}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          onContentSizeChange={scrollToLatestMessage}
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && visibleHistory.length === 0 && styles.emptyList,
          ]}
          ListHeaderComponent={renderHistoryHeader}
          ListEmptyComponent={visibleHistory.length === 0 ? renderEmptyChat : undefined}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />

        {(error || recordingError || isTranscribing) && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>
              {recordingError ||
                (isTranscribing
                  ? 'Turning your voice into text...'
                  : 'Something went wrong. Please try again.')}
            </Text>
            {isMicBlocked && Platform.OS === 'web' && (
              <Pressable
                style={({ pressed }) => [
                  styles.micBlockedButton,
                  pressed && styles.micBlockedButtonPressed,
                ]}
                onPress={() => {
                  if (typeof window === 'undefined') {
                    return;
                  }

                  // Deep paths can 404 on hard reloads of the static web build, so the
                  // link targets the app root and ?openBot=<botId> re-enters this chat.
                  const url = `${window.location.origin}/?openBot=${encodeURIComponent(bot.id)}`;
                  console.log('Opening app in new tab', { url });

                  // Popup blockers (especially in embedded iframes) can block window.open,
                  // so fall back to a synthetic anchor click, and always surface the URL
                  // for manual copy as the last resort.
                  const opened = window.open(url, '_blank');
                  if (!opened) {
                    const anchor = document.createElement('a');
                    anchor.href = url;
                    anchor.target = '_blank';
                    anchor.rel = 'noopener noreferrer';
                    document.body.appendChild(anchor);
                    anchor.click();
                    anchor.remove();
                  }

                  setStandaloneUrl(url);
                }}
                testID="open-in-new-tab-button"
              >
                <Text style={styles.micBlockedButtonText}>Open in new tab</Text>
              </Pressable>
            )}
            {standaloneUrl && (
              <Text style={styles.standaloneUrlText} selectable>
                Blocked by the preview? Copy this link into a new tab:{'\n'}
                {standaloneUrl}
              </Text>
            )}
          </View>
        )}

        {isRecording && (
          <View style={styles.recordingBanner}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingBannerText}>Listening… speak now, then tap stop when you’re done</Text>
          </View>
        )}

        <SafeAreaView edges={['bottom']} style={styles.inputSafeArea}>
          <LinearGradient
            colors={['transparent', Colors.light.background]}
            style={styles.inputGradient}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder={`Message ${bot.name}...`}
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              maxLength={2000}
              editable={!isLoading && !isRecording && !isTranscribing}
              testID="chat-input"
            />
            <View style={styles.actionsColumn}>
              <Animated.View style={{ transform: [{ scale: recordingPulse }] }}>
                <Pressable
                  style={({ pressed }) => [
                    styles.voiceButton,
                    isRecording && styles.voiceButtonActive,
                    (isLoading || isTranscribing) && styles.voiceButtonDisabled,
                    pressed && styles.sendButtonPressed,
                  ]}
                  onPress={isRecording ? handleStopRecording : handleStartRecording}
                  disabled={isLoading || isTranscribing}
                  testID="voice-button"
                >
                  {isTranscribing ? (
                    <ActivityIndicator size="small" color={bot.gradient[0]} />
                  ) : isRecording ? (
                    <Square size={18} color="#FFF" fill="#FFF" />
                  ) : (
                    <Mic size={20} color={bot.gradient[0]} />
                  )}
                </Pressable>
              </Animated.View>
              <Pressable
                style={({ pressed }) => [
                  styles.sendButton,
                  { backgroundColor: bot.gradient[0] },
                  (!input.trim() || isLoading || isRecording || isTranscribing) && styles.sendButtonDisabled,
                  pressed && styles.sendButtonPressed,
                ]}
                onPress={handleSend}
                disabled={!input.trim() || isLoading || isRecording || isTranscribing}
                testID="send-button"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Send size={20} color="#FFF" />
                )}
              </Pressable>
            </View>
          </View>
          <View style={styles.voiceHintRow}>
            <AudioLines size={14} color={Colors.light.textSecondary} />
            <Text style={styles.voiceHintText}>Tap the mic, speak naturally, then review the text before you send.</Text>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

function getSuggestions(category: string): string[] {
  const suggestions: Record<string, string[]> = {
    Music: [
      'Help me write a song about summer',
      'What makes a good melody?',
      'Suggest chord progressions for a ballad',
    ],
    Business: [
      'How can I improve my marketing strategy?',
      'Analyze my business model',
      'Tips for increasing customer retention',
    ],
    Automation: [
      'How do I automate repetitive tasks?',
      'Best practices for workflow automation',
      'Connect my apps together',
    ],
    Education: [
      'Explain quantum physics simply',
      'Help me study for my exam',
      'Create a study plan for me',
    ],
    Faith: [
      'Share an inspiring devotional',
      'Help me understand this scripture',
      'Guide me in prayer',
    ],
    Utilities: [
      'Convert this file for me',
      'Generate a QR code',
      'Summarize this text',
    ],
    Creative: [
      'Help me brainstorm ideas',
      'Suggest a color palette',
      'Review my design concept',
    ],
    Productivity: [
      'Help me prioritize my tasks',
      'Create a daily schedule',
      'Tips for staying focused',
    ],
  };

  return suggestions[category] || [
    'How can you help me?',
    'What are your features?',
    'Tell me about yourself',
  ];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  headerBack: {
    padding: 4,
    marginRight: 8,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 116,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  historyLabelRow: {
    alignSelf: 'center',
    backgroundColor: Colors.light.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  historyLabelText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  botMessageContainer: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  botAvatarText: {
    fontSize: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: Colors.light.tint,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: Colors.light.surface,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFF',
  },
  botMessageText: {
    color: Colors.light.text,
  },
  toolIndicator: {
    paddingVertical: 4,
  },
  toolText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyAvatarText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  suggestionsContainer: {
    width: '100%',
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  suggestionChip: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  suggestionPressed: {
    opacity: 0.7,
  },
  suggestionText: {
    fontSize: 15,
    color: Colors.light.text,
  },
  inputSafeArea: {
    backgroundColor: Colors.light.background,
  },
  inputGradient: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 56,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  actionsColumn: {
    gap: 10,
  },
  voiceButton: {
    width: RECORDING_BUTTON_IDLE_SIZE,
    height: RECORDING_BUTTON_IDLE_SIZE,
    borderRadius: RECORDING_BUTTON_IDLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  voiceButtonActive: {
    backgroundColor: Colors.light.error,
    borderColor: Colors.light.error,
  },
  voiceButtonDisabled: {
    opacity: 0.7,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
  voiceHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  voiceHintText: {
    flex: 1,
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: '600' as const,
  },
  errorBanner: {
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFD7D7',
    alignItems: 'center',
    gap: 8,
  },
  errorBannerText: {
    color: '#C73A3A',
    fontSize: 14,
    textAlign: 'center',
  },
  micBlockedButton: {
    backgroundColor: '#C73A3A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  micBlockedButtonPressed: {
    opacity: 0.8,
  },
  micBlockedButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700' as const,
  },
  standaloneUrlText: {
    color: '#C73A3A',
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline' as const,
  },
  recordingBanner: {
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5A5F',
  },
  recordingBannerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  speakerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 6,
    marginLeft: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  speakerButtonActive: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.surfaceAlt,
  },
  speakerButtonText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500' as const,
  },
});
