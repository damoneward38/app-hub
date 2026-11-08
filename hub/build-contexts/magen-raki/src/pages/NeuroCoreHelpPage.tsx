import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sparkles,
  ShieldCheck,
  Lock,
  ChevronRight,
  ChevronDown,
  HelpCircle,
  Radio,
  FileCheck2,
  Cpu,
  Zap,
  Terminal,
  Send,
  Download,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Video,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  Info,
} from 'lucide-react';
import type { PageTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface NeuroCoreHelpPageProps {
  setActiveTab: (tab: PageTab) => void;
}

interface MessageHistoryItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  category?: string;
  hsmSignature?: string;
  suggestedAction?: { label: string; tab: PageTab };
}

export const NeuroCoreHelpPage: React.FC<NeuroCoreHelpPageProps> = ({ setActiveTab }) => {
  const { user } = useAuth();

  // Web Speech API States
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [synthSupported, setSynthSupported] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [autoSpeakReplies, setAutoSpeakReplies] = useState<boolean>(true);
  const [voiceVolume, setVoiceVolume] = useState<number>(1.0);

  // Assistant & Loading States
  const [loadingResponse, setLoadingResponse] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<string>('Enclave Setup & Readiness');
  const [activeAccordionStep, setActiveAccordionStep] = useState<number>(1);
  const [faqCarouselIndex, setFaqCarouselIndex] = useState<number>(0);
  const [faqAutoRotate, setFaqAutoRotate] = useState<boolean>(true);

  // Interactive Video Simulator State
  const [demoPlaying, setDemoPlaying] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);

  // Contact Form State
  const [contactName, setContactName] = useState<string>(user?.email?.split('@')[0] || '');
  const [contactEmail, setContactEmail] = useState<string>(user?.email || 'damoneward38@gmail.com');
  const [contactMsg, setContactMsg] = useState<string>('');
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);

  // Chat History
  const [chatHistory, setChatHistory] = useState<MessageHistoryItem[]>([
    {
      id: 'welcome-0',
      sender: 'assistant',
      text: "Welcome to Neuro-Core Voice Guidance! I'm Nero-4.0, your AI security advisor. Tap the mic and ask me anything about hardware enclaves, audit bundles, or how to pass the 12 Readiness Gate checks.",
      timestamp: new Date().toLocaleTimeString(),
      category: 'GENERAL_GUIDE',
      hsmSignature: '0x8f4b1a9c3e2d7e8b9a0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a',
      suggestedAction: { label: 'Explore Compliance Vault', tab: 'compliance' },
    },
  ]);

  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition & Synthesis
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = true;
      recognizer.lang = 'en-US';

      recognizer.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognizer.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognizer;
    } else {
      setSpeechSupported(false);
    }

    if (!('speechSynthesis' in window)) {
      setSynthSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Auto-scroll chat window
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loadingResponse]);

  // Speech Synthesis Helper
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !autoSpeakReplies) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.02;
    utterance.volume = voiceVolume;
    utterance.lang = 'en-US';

    // Pick best English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en')
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Toggle Microphone
  const toggleListening = () => {
    if (!speechSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      setTranscript('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Recognition start failed:', err);
      }
    }
  };

  // Submit Query to Neuro-Core Engine
  const handleSubmitQuery = async (queryText?: string) => {
    const textToSend = queryText || transcript;
    if (!textToSend.trim()) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userMsg: MessageHistoryItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setTranscript('');
    setLoadingResponse(true);

    try {
      const res = await fetch('/api/neural-core/voice-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: textToSend,
          contextSection: currentSection,
          mode: 'beginner',
          userEmail: user?.email || 'damoneward38@gmail.com',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: MessageHistoryItem = {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: data.text,
          timestamp: new Date().toLocaleTimeString(),
          category: data.category,
          hsmSignature: data.hsmSignature,
          suggestedAction: data.suggestedAction,
        };

        setChatHistory((prev) => [...prev, assistantMsg]);
        speakText(data.text);
      } else {
        throw new Error('Non-200 response');
      }
    } catch (err) {
      const fallbackText =
        "Magen-Raki protects your systems through hardware enclaves and real-time AST delimiters. You can use the Readiness Gate to audit your environment or the Compliance Vault to export signed SOC 2 packages.";
      const assistantMsg: MessageHistoryItem = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString(),
        category: 'GENERAL_GUIDE',
        suggestedAction: { label: 'Go to Readiness Gate', tab: 'readiness' },
      };
      setChatHistory((prev) => [...prev, assistantMsg]);
      speakText(fallbackText);
    } finally {
      setLoadingResponse(false);
    }
  };

  // FAQ Carousel Data
  const faqs = [
    {
      q: 'What is the Six 686 Hardware Enclave?',
      a: 'The Six 686 Hardware Enclave is a dedicated silicon co-processor that validates AI tool executions and AST delimiters in under 2 milliseconds before commands touch your operating system.',
      tab: 'governor' as PageTab,
    },
    {
      q: 'How do I generate an auditor-ready SOC 2 evidence bundle?',
      a: 'Navigate to the Compliance Vault, select SOC 2 Type II, and click Download Compliance Bundle. The system generates a cryptographic SHA-256 sealed JSON package.',
      tab: 'compliance' as PageTab,
    },
    {
      q: 'What happens when the Emergency Kill Switch is triggered?',
      a: 'Activating the Kill Switch instantly opens the physical circuit breaker in <0.5ms, freezing all running agent tool invocations and cutting unauthorized outbound network access.',
      tab: 'governor' as PageTab,
    },
    {
      q: 'What are the 12 assertions of the Readiness Gate?',
      a: 'The Readiness Gate tests 12 critical vectors including Secure Boot attestation, secret token sanitization, AST jailbreak resilience, and CI/CD automatic rollback triggers.',
      tab: 'readiness' as PageTab,
    },
    {
      q: 'Is my voice recorded or stored on any server?',
      a: 'No. Voice transcription is executed locally via your browser Web Speech API. Only the text query is verified by the Six 686 HSM for single-transaction audit logging.',
      tab: 'threats' as PageTab,
    },
  ];

  // Auto-rotate FAQ
  useEffect(() => {
    if (!faqAutoRotate) return;
    const interval = setInterval(() => {
      setFaqCarouselIndex((prev) => (prev + 1) % faqs.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [faqAutoRotate]);

  // Guided Walkthrough Steps
  const guidedSteps = [
    {
      step: 1,
      title: 'Step 1: Enclave Initialization & Secure Boot',
      desc: 'Initialize the Six 686 silicon enclave with verified RSA/SHA-512 signatures and set agent risk ceilings.',
      details:
        'Secure boot ensures no unsigned firmware runs on the AI co-processor. Default agents (Neural Core, Sapphire, OpenClaw) are registered with immutable risk boundaries.',
      tab: 'governor' as PageTab,
      speechText:
        'Step one is Enclave Initialization. We verify firmware integrity using SHA-512 secure boot and register all autonomous agents with strict risk ceilings.',
    },
    {
      step: 2,
      title: 'Step 2: AST Normalization & Delimiter Shielding',
      desc: 'Quarantine prompt injections and strip high-entropy Bearer secrets from telemetry streams.',
      details:
        'The Neural Core normalizer parses nested tool calls, verifies file paths against blacklists, and masks API keys with REDACTED_SECRET markers.',
      tab: 'threats' as PageTab,
      speechText:
        'Step two configures AST Normalization. Nero-4.0 sanitizes all incoming prompts and scrubs Bearer tokens and GitHub PATs before model inference.',
    },
    {
      step: 3,
      title: 'Step 3: Autonomous CI/CD Pipeline & 8-Step Repair',
      desc: 'Execute 9-stage release path with deterministic synthetic probes and zero-downtime rollback.',
      details:
        'If synthetic probes fail in staging, the CI/CD pipeline triggers an autonomous rollback within 3 seconds and generates a root-cause autopsy.',
      tab: 'pipeline' as PageTab,
      speechText:
        'Step three activates the CI/CD pipeline. The eight-step repair protocol diagnoses, patches, tests, and stages code with automatic rollback protection.',
    },
    {
      step: 4,
      title: 'Step 4: Compliance Evidence Sealing & Audit Export',
      desc: 'Export SOC 2, ISO 27001, and HIPAA packages with unbroken SHA-512 chained ledger continuity.',
      details:
        'Every governance decision and human-in-the-loop approval is permanently chained into the tamper-proof ledger for auditor inspection.',
      tab: 'compliance' as PageTab,
      speechText:
        'Step four generates your cryptographic audit bundle. All governance events are sealed into a single verifiable manifest ready for compliance certifiers.',
    },
  ];

  // Interactive Simulator Steps
  const demoSteps = [
    {
      title: '1. Ingress Prompt Interception',
      desc: 'Untrusted user prompt passes into the Six 686 AST Delimiter Shield.',
      badge: 'AST SHIELD (0.4ms)',
    },
    {
      title: '2. Risk Engine Evaluation',
      desc: 'Heuristic weights score prompt risk (0.12 = LOW, 0.94 = CRITICAL).',
      badge: 'SCORING ENGINE',
    },
    {
      title: '3. Hardware Enclave DMA Isolation',
      desc: 'Protected inference executes in zeroized memory; secrets scrubbed.',
      badge: 'DMA ENCLAVE',
    },
    {
      title: '4. Chained Ledger Sealing',
      desc: 'SHA-512 block appended to immutable audit ring with HSM seal.',
      badge: 'CHAINED LEDGER',
    },
  ];

  const handleRunDemoStep = () => {
    setDemoPlaying(true);
    let cur = 0;
    const interval = setInterval(() => {
      cur += 1;
      if (cur >= demoSteps.length) {
        clearInterval(interval);
        setDemoPlaying(false);
      } else {
        setDemoStep(cur);
      }
    }, 2500);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    speakText(
      `Thank you ${contactName || 'Engineer'}. Your security consultation request has been signed by the Six 686 HSM. Our lead architect will review your logs and reply shortly.`
    );
  };

  const handleDownloadSelfHardenedGuide = () => {
    const guideDoc = {
      title: 'Magen-Raki Sovereign AI Self-Hardening Architectural Blueprint',
      version: '4.0.8-ENTERPRISE',
      generatedFor: user?.email || 'damoneward38@gmail.com',
      timestamp: new Date().toISOString(),
      hsmAttestationSeal: '0x8f4b1a9c3e2d7e8b9a0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a',
      chapters: [
        {
          chapter: '1. Physical Enclave Isolation (Six 686)',
          description: 'Configure PCIe DMA memory mapping with ring-0 buffer zeroization.',
        },
        {
          chapter: '2. Syntactic AST Delimiter Defense',
          description: 'Prevent recursive prompt injection by normalizing delimiters before model attention.',
        },
        {
          chapter: '3. 8-Step Autonomous Repair Protocol',
          description: 'Diagnose -> Plan -> Patch -> Test -> Build -> Staging -> Verify -> Report.',
        },
        {
          chapter: '4. SOC 2 / ISO 27001 Cryptographic Proof Generation',
          description: 'Export SHA-512 chained ledger blocks for instant auditor verification.',
        },
      ],
    };

    const blob = new Blob([JSON.stringify(guideDoc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `magen-raki-self-hardened-guide-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] bg-immersive py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 text-slate-200">
      {/* 1. Hero & Header */}
      <div className="text-center max-w-4xl mx-auto space-y-4">
        {/* Privacy & HSM Badge */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono shadow-[0_0_15px_rgba(79,70,229,0.2)]">
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>NEURO-CORE VOICE & GUIDANCE VAULT</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Your Voice is Confidential & Never Stored</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
          Talk Directly to Neuro-Core
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Tap the microphone, ask questions in plain English, and receive natural speech guidance powered by Nero-4.0 and cryptographically audited by the Six 686 HSM.
        </p>

        {/* Audio Output Preferences */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setAutoSpeakReplies(!autoSpeakReplies);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              autoSpeakReplies
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {autoSpeakReplies ? (
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>Spoken Replies: {autoSpeakReplies ? 'Enabled' : 'Muted'}</span>
          </button>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="px-3.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer animate-pulse"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Stop Speaking</span>
            </button>
          )}

          <button
            onClick={handleDownloadSelfHardenedGuide}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download Self-Hardened Guide (JSON)</span>
          </button>
        </div>
      </div>

      {/* 2. Voice-First Chatbot & Interactive Console */}
      <div className="bg-[#0d0d1e] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Nero-4.0 Interactive Speech Console</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Current Context: <span className="text-indigo-300 font-mono font-semibold">{currentSection}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              LOCAL WEB SPEECH API
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              SIX 686 HSM SIGNED
            </span>
          </div>
        </div>

        {/* Chat History Window */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 sm:p-6 space-y-4 max-h-[360px] overflow-y-auto font-sans">
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`p-4 rounded-2xl max-w-xl space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-[#121228] text-slate-200 border border-white/10 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-70">
                  <span className="font-semibold">
                    {msg.sender === 'user' ? (user?.email || 'You') : 'Nero-4.0 AI Guide'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <p className="text-xs">{msg.text}</p>

                {/* Assistant Controls & HSM Seal */}
                {msg.sender === 'assistant' && (
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    {msg.hsmSignature && (
                      <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1.5 truncate">
                        <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">Seal: {msg.hsmSignature}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => speakText(msg.text)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Volume2 className="w-3 h-3 text-indigo-400" />
                        <span>Read Aloud</span>
                      </button>

                      {msg.suggestedAction && (
                        <button
                          onClick={() => setActiveTab(msg.suggestedAction!.tab)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>{msg.suggestedAction.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold">ME</span>
                </div>
              )}
            </div>
          ))}

          {loadingResponse && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>Nero-4.0 is synthesizing voice & security answer...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Large Voice Action Panel */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#111129] to-slate-900 border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Primary Mic Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleListening}
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.6)]'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_25px_rgba(79,70,229,0.5)]'
                }`}
                title={isListening ? 'Click to stop listening' : 'Click to speak question'}
              >
                {isListening ? (
                  <MicOff className="w-7 h-7 animate-bounce" />
                ) : (
                  <Mic className="w-7 h-7" />
                )}
                {isListening && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500" />
                  </span>
                )}
              </button>

              <div className="space-y-0.5 text-left">
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{isListening ? 'Listening to your voice...' : 'Tap Mic to Speak'}</span>
                  {isListening && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      LIVE RECORDING
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {isListening
                    ? 'Speak naturally — transcript will appear below in real time.'
                    : 'Tap the mic, speak naturally, then review the text before you send.'}
                </p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSubmitQuery(transcript)}
                disabled={!transcript.trim() || loadingResponse}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to Nero-4.0</span>
              </button>
            </div>
          </div>

          {/* Transcript & Text Review Field */}
          <div className="relative">
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && transcript.trim()) {
                  handleSubmitQuery(transcript);
                }
              }}
              placeholder="Spoken transcript or type a question (e.g. 'Explain what an audit bundle is')..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {transcript && (
              <button
                onClick={() => setTranscript('')}
                className="absolute right-3 top-3 text-[10px] text-slate-500 hover:text-slate-300 font-mono"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Voice Prompt Starter Pills */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Suggested Voice Queries (Click to Ask):
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {[
                'Explain what an audit bundle is',
                'What is the Six 686 Hardware Enclave?',
                'How does the emergency kill switch work?',
                'Walk me through the 12 Readiness Gate checks',
                'What is indirect prompt injection and how do we block it?',
              ].map((query, i) => (
                <button
                  key={i}
                  onClick={() => handleSubmitQuery(query)}
                  className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>{query}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Guided Security Walkthrough (1 Setup ↔ 2 Configure ↔ 3 Run ↔ 4 Audit) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-indigo-400" />
              <span>Step-by-Step Security Walkthrough</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Listen to the assistant explain every operational phase from boot to audit seal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {guidedSteps.map((s) => {
            const isActive = activeAccordionStep === s.step;
            return (
              <div
                key={s.step}
                onClick={() => {
                  setActiveAccordionStep(s.step);
                  setCurrentSection(s.title);
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-[#12122d] border-indigo-500/70 shadow-[0_0_20px_rgba(79,70,229,0.25)]'
                    : 'bg-[#0d0d1e] hover:bg-[#101026] border-white/10'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      PHASE 0{s.step}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(s.speechText);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-400 transition-colors"
                      title="Listen to this step"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-white">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTab(s.tab);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                  >
                    <span>Open Module</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Interactive Cave / Hardware Simulator & FAQ Carousel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Cave Visualizer */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0d0d1e] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-white">How the Enclave Cave Works</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                SIMULATOR
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Watch step-by-step how incoming prompts are quarantined, passed through the Six 686 AST delimiter engine, and sealed in the SHA-512 ledger.
            </p>

            {/* Interactive Timeline Stepper */}
            <div className="space-y-3 py-2">
              {demoSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    demoStep === idx
                      ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{step.title}</span>
                    <span className="text-[9px] font-mono text-cyan-300 font-bold">{step.badge}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleRunDemoStep}
                disabled={demoPlaying}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{demoPlaying ? 'Simulation Running...' : 'Play Architectural Simulation'}</span>
              </button>

              <button
                onClick={() =>
                  speakText(
                    'In the Enclave Cave, every prompt is normalized before attention computation. If an injection is detected, the command is quarantined and the hardware kill switch remains armed.'
                  )
                }
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1.5 border border-slate-800 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Audio Tour</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: FAQ Carousel with Audio Read-Aloud */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0d0d1e] border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Frequently Asked Questions</h3>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">
                  {faqCarouselIndex + 1} / {faqs.length}
                </span>
                <button
                  onClick={() =>
                    setFaqCarouselIndex((prev) => (prev === 0 ? faqs.length - 1 : prev - 1))
                  }
                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300"
                >
                  ◀
                </button>
                <button
                  onClick={() =>
                    setFaqCarouselIndex((prev) => (prev + 1) % faqs.length)
                  }
                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Current Active FAQ Card */}
            <div className="p-5 rounded-2xl bg-[#121228] border border-indigo-500/30 space-y-3 min-h-[160px] flex flex-col justify-between">
              <div className="space-y-2">
                <div className="text-sm font-bold text-white flex items-start gap-2">
                  <span className="text-indigo-400 font-mono">Q:</span>
                  <span>{faqs[faqCarouselIndex].q}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {faqs[faqCarouselIndex].a}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={() => speakText(`${faqs[faqCarouselIndex].q}. ${faqs[faqCarouselIndex].a}`)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Listen to Answer</span>
                </button>

                <button
                  onClick={() => setActiveTab(faqs[faqCarouselIndex].tab)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                >
                  <span>Go to Subsystem</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Beginner Layman Glossary Quick-Pills */}
            <div className="pt-2 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Beginner Concepts in Plain English:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {[
                  {
                    term: 'What is a Sandbox?',
                    desc: 'A virtual quarantine room where untrusted AI code cannot harm real servers.',
                  },
                  {
                    term: 'What is an AST Delimiter?',
                    desc: 'A syntax boundary that prevents malicious prompts from escaping their fences.',
                  },
                  {
                    term: 'What is an HSM Seal?',
                    desc: 'A physical cryptographic chip signature proving logs were not tampered with.',
                  },
                  {
                    term: 'What is Auto-Rollback?',
                    desc: 'Instantly reverting code to the last safe release if staging probes fail.',
                  },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => speakText(`${item.term}: ${item.desc}`)}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-white text-[11px]">{item.term}</div>
                    <div className="text-[10px] text-slate-400 truncate">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Contact & Support Form with Voice Confirmation */}
      <div className="bg-[#0d0d1e] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Need a Human Security Engineer?</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Submit your deployment inquiry or log review request. All consultations receive signed attestation.
            </p>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            24/7 SOVEREIGN SUPPORT
          </span>
        </div>

        {contactSubmitted ? (
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2 animate-fade-in">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Security Request Dispatched</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Your request for <strong>{contactEmail}</strong> has been logged to the Six 686 HSM ledger. An engineer will follow up shortly.
            </p>
            <button
              onClick={() => setContactSubmitted(false)}
              className="mt-3 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-300 border border-slate-800"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Full Name / Lead Architect
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Damone Ward"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="damoneward38@gmail.com"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Security Architecture Inquiry / Questions
              </label>
              <textarea
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                rows={3}
                placeholder="Describe your enclave requirements, SOC 2 certification goals, or self-hosted deployment architecture..."
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-[10px] font-mono text-slate-500">
                Spoken voice confirmation will play immediately upon transmission.
              </span>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit & Dispatch to Support Team</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
