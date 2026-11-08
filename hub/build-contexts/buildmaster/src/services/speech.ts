/**
 * Speech Recognition and Text-to-Speech Engine
 * Provides "Hey Sapphire" wake word detection and high-fidelity vocal synthesis.
 */

// Define Speech Recognition types for standard browser compatibility
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class SpeechEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private onWakeWordDetected: (() => void) | null = null;
  private onTranscript: ((text: string, isFinal: boolean) => void) | null = null;
  private isMuted: boolean = false;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      this.recognition = new SpeechRecognitionClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const combined = (finalTranscript || interimTranscript).toLowerCase();
        
        // Wake word trigger
        if (combined.includes('hey sapphire') || combined.includes('sapphire')) {
          if (this.onWakeWordDetected) {
            this.onWakeWordDetected();
          }
        }

        if (this.onTranscript) {
          this.onTranscript(finalTranscript || interimTranscript, Boolean(finalTranscript));
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition status/error:', event.error);
        if (event.error === 'not-allowed') {
          this.isListening = false;
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch {
            // Already started or restarting
          }
        }
      };
    }
  }

  public startListening(
    onWakeWord?: () => void,
    onTranscriptText?: (text: string, isFinal: boolean) => void
  ): boolean {
    if (!this.recognition) {
      console.warn('SpeechRecognition not supported in this browser.');
      return false;
    }
    this.onWakeWordDetected = onWakeWord || null;
    this.onTranscript = onTranscriptText || null;
    this.isListening = true;

    try {
      this.recognition.start();
      return true;
    } catch {
      return false;
    }
  }

  public stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
    }
  }

  public speak(text: string, onEnd?: () => void) {
    if (this.isMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    // Strip markdown tags and code blocks for crisp speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*_#~[\]()]/g, ' ')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    // Prefer natural / high quality female/male English voices
    const preferredVoice = voices.find(v => 
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen')) && 
      v.lang.startsWith('en')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopSpeaking();
    }
    return this.isMuted;
  }

  public getMutedStatus(): boolean {
    return this.isMuted;
  }
}

export const speechService = new SpeechEngine();
