import React, { useState, useEffect, useRef } from "react";
import { 
  Cpu, 
  Terminal, 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Settings, 
  Shield, 
  AlertTriangle, 
  Activity, 
  RefreshCw, 
  Zap, 
  Send, 
  Play, 
  Sparkles,
  Database,
  Grid,
  Lock,
  ChevronRight,
  Monitor
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Capacitor } from "@capacitor/core";
import { SpeechRecognition as CapSpeechRecognition } from "@capacitor-community/speech-recognition";
import { nativeSpeechAdapter } from "./NativeSpeechAdapter";

import { HardwareTab } from "./components/HardwareTab";
import { SettingsTab } from "./components/SettingsTab";
import { JervisMemory } from "./types";


// Web Audio API Synthesizer for futuristic sci-fi sound effects
class JervisSoundSynth {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playBeep(freq = 800, type: OscillatorType = "sine", duration = 0.05, gainValue = 0.05) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gainNode.gain.setValueAtTime(gainValue, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playAmbientPulse() {
    if (this.muted) return;
    this.playBeep(220, "sine", 0.3, 0.02);
  }

  playConfirm() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.04, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      gainNode.connect(this.ctx.destination);

      const osc1 = this.ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc1.connect(gainNode);

      const osc2 = this.ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1046.5, now); // C6
      osc2.frequency.setValueAtTime(1318.5, now + 0.08); // E6
      osc2.connect(gainNode);

      osc1.start();
      osc2.start();
      osc1.stop(now + 0.25);
      osc2.stop(now + 0.25);
    } catch (e) {}
  }

  playAlert() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.08, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      gainNode.connect(this.ctx.destination);

      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.3);
      osc.connect(gainNode);

      osc.start();
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  playSystemScan() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.03, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      gainNode.connect(this.ctx.destination);

      const osc = this.ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(3000, now + 0.5);
      osc.connect(gainNode);

      osc.start();
      osc.stop(now + 0.5);
    } catch (e) {}
  }
}

const jervisSynth = new JervisSoundSynth();

interface Message {
  sender: "user" | "jervis";
  text: string;
  timestamp: string;
}

interface LogEntry {
  text: string;
  type: "info" | "success" | "warn" | "error" | "comm";
  timestamp: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "jervis",
      text: "At your service, Sir. Neural modules are initialized. Tap my Arc Reactor to initiate voice communication or issue keyboard protocols below.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(true);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(true);
  const [jervisVoice, setJervisVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  // Custom interactive system controls
  const [shieldActive, setShieldActive] = useState(false);
  const [reactorOverdrive, setReactorOverdrive] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState<number | null>(null);
  const [selectedActionTab, setSelectedActionTab] = useState<'diagnostics' | 'hardware' | 'settings'>('diagnostics');

  // Security and custom settings states
  const [appUnlocked, setAppUnlocked] = useState(false);
  const [pinCode, setPinCode] = useState(() => localStorage.getItem("jervis_pin_code") || "");
  const [pinLockActive, setPinLockActive] = useState(() => localStorage.getItem("jervis_pin_lock_active") === "true");
  const [privacyMode, setPrivacyMode] = useState(() => localStorage.getItem("jervis_privacy_mode") === "true");
  const [activeProvider, setActiveProvider] = useState("Gemini-3.5-Flash");
  
  const [memory, setMemory] = useState<JervisMemory>(() => {
    const saved = localStorage.getItem("jervis_memory");
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed ? {
      ...parsed,
      userPrefs: {
        theme: "dark",
        largeText: false,
        provider: "Gemini-3.5-Flash",
        wakeWord: "Jervis",
        continuousListening: false,
        speechLang: "en-US",
        ...parsed.userPrefs
      }
    } : {
      nickname: "Sir",
      favoriteApp: "WhatsApp",
      tonyGreeting: "Welcome back, Sir.",
      userPrefs: {
        theme: "dark",
        largeText: false,
        provider: "Gemini-3.5-Flash",
        wakeWord: "Jervis",
        continuousListening: false,
        speechLang: "en-US"
      }
    };
  });

  useEffect(() => {
    localStorage.setItem("jervis_memory", JSON.stringify(memory));
  }, [memory]);

  useEffect(() => {
    localStorage.setItem("jervis_pin_code", pinCode);
  }, [pinCode]);

  useEffect(() => {
    localStorage.setItem("jervis_pin_lock_active", String(pinLockActive));
  }, [pinLockActive]);

  useEffect(() => {
    localStorage.setItem("jervis_privacy_mode", String(privacyMode));
  }, [privacyMode]);

  // Real Hardware control states (Capacitor & Web standard fallback)
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [waNumber, setWaNumber] = useState("");
  const [waMessage, setWaMessage] = useState("Hello Jervis, secure communications link verified.");

  // Simulated metrics
  const [reactorOutput, setReactorOutput] = useState(98.4);
  const [coreTemp, setCoreTemp] = useState(38.2);
  const [latency, setLatency] = useState(42);

  // System Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    { text: "Jervis OS Core loading...", type: "info", timestamp: "14:04:02" },
    { text: "Arc Reactor stabilizing at 98.4% output", type: "success", timestamp: "14:04:03" },
    { text: "Gemini server gateway link established", type: "comm", timestamp: "14:04:04" },
    { text: "Ready for user voice interface protocols", type: "info", timestamp: "14:04:05" },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Keep references to latest states to avoid stale closure issues in SpeechRecognition handlers
  const continuousListeningRef = useRef(false);
  const speechLangRef = useRef("en-US");
  const isSpeakingRef = useRef(false);
  const isThinkingRef = useRef(false);
  const isListeningRef = useRef(false);
  const consecutiveSpeechErrorsRef = useRef(0);

  useEffect(() => {
    continuousListeningRef.current = !!memory.userPrefs?.continuousListening;
  }, [memory.userPrefs?.continuousListening]);

  useEffect(() => {
    speechLangRef.current = memory.userPrefs?.speechLang || "en-US";
  }, [memory.userPrefs?.speechLang]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isThinkingRef.current = isThinking;
  }, [isThinking]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Decoupled, ultra-robust loop for continuous listening with an active watchdog timer:
  // Runs whenever continuousListening, isSpeaking, isThinking, or isListening changes.
  useEffect(() => {
    let watchdogInterval: any = null;
    let timer: any = null;

    if (memory.userPrefs?.continuousListening) {
      // We only want the mic to turn on when:
      // 1. We are NOT speaking
      // 2. We are NOT thinking (waiting for API response)
      // 3. We are NOT already listening
      if (!isSpeaking && !isThinking && !isListening) {
        timer = setTimeout(() => {
          if (
            memory.userPrefs?.continuousListening &&
            !isSpeakingRef.current &&
            !isThinkingRef.current &&
            !isListeningRef.current &&
            recognitionRef.current
          ) {
            try {
              recognitionRef.current.lang = memory.userPrefs?.speechLang || "en-US";
              recognitionRef.current.start();
              addLog("Neural mic input stream online. Listening...", "success");
            } catch (e) {
              // Ignore if already listening
            }
          }
        }, 400); // Shorter comfortable gap to be highly responsive
      }

      // Start an active watchdog check every 1500ms to instantly revive the listener
      // if it closed due to silence (no-speech) or other transient browser timeouts.
      watchdogInterval = setInterval(() => {
        if (
          memory.userPrefs?.continuousListening &&
          !isSpeakingRef.current &&
          !isThinkingRef.current &&
          !isListeningRef.current &&
          recognitionRef.current
        ) {
          try {
            recognitionRef.current.lang = memory.userPrefs?.speechLang || "en-US";
            recognitionRef.current.start();
            // Silent restoration to prevent spamming UI logs on normal silence timeouts
            console.log("Neural mic watchdog auto-restored voice sync.");
          } catch (e) {
            // Already active or starting, safe to ignore
          }
        }
      }, 1500);
    } else {
      // If continuous listening is turned off, make sure we stop
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.stop();
          addLog("Neural mic input stream offline.", "warn");
        } catch (e) {}
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (watchdogInterval) clearInterval(watchdogInterval);
    };
  }, [memory.userPrefs?.continuousListening, isSpeaking, isThinking, isListening]);

  // Initialize Speech Synthesis and Speech Recognition
  useEffect(() => {
    const initSpeech = async () => {
      const isNative = typeof window !== "undefined" && (window as any).Capacitor && (window as any).Capacitor.isNative;
      // For WebView/Native environments, ensure we request microphone permission first
      try {
        if (!isNative && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop()); // close immediately after granted
        }
      } catch (err) {
        addLog("Microphone permission was denied or is unavailable.", "warn");
      }

      // Check speech recognition
      const WebSpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      let rec: any = null;
      if (isNative) {
        rec = nativeSpeechAdapter;
      } else if (WebSpeechRecognition) {
        rec = new WebSpeechRecognition();
      }

      if (!rec) {
        setSpeechRecognitionSupported(false);
        addLog("Local mic speech recognition not natively supported in this browser environment.", "warn");
      } else {
        rec.continuous = false;
        rec.interimResults = true;
      
      // Get initial language setting from storage
      let initialLang = "en-US";
      try {
        const saved = localStorage.getItem("jervis_memory");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.userPrefs?.speechLang) {
            initialLang = parsed.userPrefs.speechLang;
          }
        }
      } catch (e) {}
      rec.lang = initialLang;

      rec.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        consecutiveSpeechErrorsRef.current = 0; // Reset errors on successful voice gateway sync
        setTranscript("Listening...");
        jervisSynth.playBeep(440, "sine", 0.1, 0.05);
        addLog("Neural mic input stream open. Speaking...", "info");
      };

      rec.onresult = (event: any) => {
        consecutiveSpeechErrorsRef.current = 0; // Reset errors on successful speech capture
        const resultText = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join("");
        setTranscript(resultText);
      };

      rec.onerror = (event: any) => {
        const errType = event.error || "unknown";
        console.warn("Speech Recognition Error", errType);
        setIsListening(false);
        isListeningRef.current = false;
        setTranscript("");
        
        const quietErrors = ["aborted", "no-speech"];
        const criticalErrors = ["not-allowed", "service-not-allowed", "language-not-supported", "unknown"];

        if (criticalErrors.includes(errType)) {
          // Disable continuous listening immediately for permission or support issues to avoid tight error/watchdog loop
          setMemory((prev: any) => ({
            ...prev,
            userPrefs: {
              ...prev?.userPrefs,
              continuousListening: false
            }
          }));
          jervisSynth.playAlert();
          addLog(`Voice protocol HALTED: Microphone permission or speech recognition is disabled or unsupported (${errType}). Please allow permissions, Sir.`, "error");
          return;
        }

        if (!quietErrors.includes(errType)) {
          consecutiveSpeechErrorsRef.current += 1;
          jervisSynth.playAlert();
          addLog(`Voice input anomaly: ${errType}`, "error");

          // Safe protective trigger: halt continuous stream if too many consecutive failures occur
          if (consecutiveSpeechErrorsRef.current >= 3) {
            setMemory((prev: any) => ({
              ...prev,
              userPrefs: {
                ...prev?.userPrefs,
                continuousListening: false
              }
            }));
            addLog("Continuous voice connection suspended due to repeated network or hardware anomalies, Sir. Switching to manual override.", "error");
            consecutiveSpeechErrorsRef.current = 0;
          }
        }
      };

      rec.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
        addLog("Neural mic input stream offline", "info");
      };

      recognitionRef.current = rec;
    }

    // Check speech synthesis & select classy British voice if possible
    if (isNative) {
      setSpeechSynthesisSupported(true);
    } else if (typeof window !== "undefined" && window.speechSynthesis) {
      const getVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Look for British male voice (JARVIS style)
        const britishMale = voices.find(v => 
          (v.lang.includes("GB") || v.lang.includes("UK") || v.lang.includes("en-")) && 
          (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("daniel") || v.name.toLowerCase().includes("google uk english male"))
        );
        // Fallback to any UK or default english voice
        const fallbackUK = voices.find(v => v.lang.includes("GB") || v.lang.includes("UK"));
        const fallbackEN = voices.find(v => v.lang.startsWith("en"));
        
        setJervisVoice(britishMale || fallbackUK || fallbackEN || voices[0] || null);
      };

      getVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = getVoices;
      }
    } else {
      setSpeechSynthesisSupported(false);
      addLog("Vocal feedback synthesis not supported in this browser environment.", "warn");
    }
    
    // Play initial start beep
    jervisSynth.playConfirm();
  };

  initSpeech();
  }, []);

  // Sync scroll on logs and chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Simulate subtle real-time fluctuations of suit stats
  useEffect(() => {
    const timer = setInterval(() => {
      // reactor fluctuation
      setReactorOutput(prev => {
        const base = reactorOverdrive ? 148.2 : 98.4;
        const change = (Math.random() - 0.5) * 0.4;
        return parseFloat((base + change).toFixed(1));
      });
      // core temp fluctuation
      setCoreTemp(prev => {
        const base = reactorOverdrive ? 82.5 : 38.2;
        const change = (Math.random() - 0.5) * 0.2;
        return parseFloat((base + change).toFixed(1));
      });
      // latency
      setLatency(prev => {
        const change = Math.floor((Math.random() - 0.5) * 5);
        return Math.max(10, Math.min(150, prev + change));
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [reactorOverdrive]);

  const addLog = (text: string, type: "info" | "success" | "warn" | "error" | "comm") => {
    if (privacyMode && type !== "error") return; // Restrict logs in privacy mode
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    setLogs(prev => [...prev, { text, type, timestamp: time }]);
  };

  // Speaks out responses using SpeechSynthesis
  const speakResponse = async (text: string) => {
    if (isMuted || !speechSynthesisSupported) return;
    try {
      const isNative = typeof window !== "undefined" && (window as any).Capacitor && (window as any).Capacitor.isNative;
      
      if (!isNative) {
        window.speechSynthesis.cancel(); // Stop any active speech
      }

      // Abort active recognition immediately so JARVIS doesn't listen to his own speech output
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      // Clean up text slightly to speak better (remove markdown asterisks)
      const cleanText = text.replace(/\*/g, "").replace(/`/g, "").trim();
      
      if (isNative) {
        setIsSpeaking(true);
        isSpeakingRef.current = true;
        const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
        await TextToSpeech.speak({
          text: cleanText,
          lang: memory.userPrefs?.speechLang || 'en-GB',
          rate: 1.05,
          pitch: 0.95,
          category: 'ambient',
        });
        setIsSpeaking(false);
        isSpeakingRef.current = false;
      } else {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        if (jervisVoice) {
          utterance.voice = jervisVoice;
        }
        utterance.pitch = 0.95; // Slightly lower pitch for classy tone
        utterance.rate = 1.05;  // Classy butler speed
  
        utterance.onstart = () => {
          setIsSpeaking(true);
          isSpeakingRef.current = true;
        };
        utterance.onend = () => {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
        };
  
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
    }
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (!speechRecognitionSupported) {
      addLog("Mic input unavailable. Please use terminal commands below.", "warn");
      jervisSynth.playAlert();
      return;
    }

    const nextContinuousState = !memory.userPrefs?.continuousListening;

    // Play feedback sound
    jervisSynth.playBeep(nextContinuousState ? 600 : 400, "sine", 0.08, 0.04);

    // Toggle continuous listening preference - which will automatically trigger our declarative useEffect to start/stop listening
    setMemory(prev => ({
      ...prev,
      userPrefs: {
        ...prev.userPrefs,
        continuousListening: nextContinuousState
      }
    }));

    if (nextContinuousState) {
      if (typeof window !== "undefined" && (window as any).Capacitor && (window as any).Capacitor.isNative) {
        import('@capacitor-community/text-to-speech').then(({ TextToSpeech }) => {
          TextToSpeech.stop().catch(() => {});
        });
      } else {
        window.speechSynthesis.cancel(); // Mute currently speaking Jervis
      }
      setIsSpeaking(false);
      addLog("Continuous listening engaged. Voice protocols online, Sir.", "success");
    } else {
      addLog("Continuous listening disengaged. Voice protocols offline.", "warn");
      try {
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
      } catch (e) {}
    }
  };

  // Synchronize Speech Recognition language on change
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = memory.userPrefs?.speechLang || "en-US";
    }
  }, [memory.userPrefs?.speechLang]);

  // Automatically submit transcribed text once recognition ends
  useEffect(() => {
    if (!isListening && transcript && transcript !== "Listening...") {
      handleSendMessage(transcript);
      setTranscript("");
    }
  }, [isListening, transcript]);

  // Toggle the physical phone flashlight (torch) using modern Web Standards API
  const toggleFlashlight = async (forceState?: boolean) => {
    const targetState = forceState !== undefined ? forceState : !flashlightOn;
    
    if (targetState) {
      try {
        addLog("Initializing hardware video stream for torch constraint...", "info");
        // Request camera with back (environment) camera which is where the flash is
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } }
        });
        
        const track = stream.getVideoTracks()[0];
        if (track) {
          // Attempt to turn on the torch (flashlight)
          const capabilities = track.getCapabilities() as any;
          if (capabilities.torch || 'torch' in capabilities) {
            await track.applyConstraints({
              advanced: [{ torch: true }] as any
            });
            setMediaStream(stream);
            setFlashlightOn(true);
            jervisSynth.playConfirm();
            addLog("Hardware FLASH LIGHT: ENGAGED [ACTIVE]", "success");
            return true;
          } else {
            addLog("Torch control constraint not supported on this device's environment camera.", "warn");
            track.stop();
            // Fallback to simulated screen flashlight
            addLog("PROTOCOL OVERRIDE: Activating Holographic Front Screen Torch (screen brightness matrix) as hardware backup.", "info");
            setFlashlightOn(true);
            jervisSynth.playConfirm();
            return true;
          }
        }
      } catch (err: any) {
        console.error("Camera torch error:", err);
        addLog(`Physical torch access failed: ${err.message}.`, "warn");
        addLog("PROTOCOL OVERRIDE: Activating Holographic Front Screen Torch (screen brightness matrix) as hardware backup.", "info");
        setFlashlightOn(true);
        jervisSynth.playConfirm();
        return true;
      }
      setFlashlightOn(false);
      return false;
    } else {
      if (mediaStream) {
        try {
          const track = mediaStream.getVideoTracks()[0];
          if (track) {
            await track.applyConstraints({
              advanced: [{ torch: false }] as any
            });
            track.stop();
          }
        } catch (e) {}
        setMediaStream(null);
      }
      setFlashlightOn(false);
      jervisSynth.playBeep(400, "sine", 0.08, 0.03);
      addLog("Hardware FLASH LIGHT / Holographic backup: DISENGAGED", "warn");
      return true;
    }
  };

  // Open native WhatsApp via deep link protocol
  const openWhatsApp = (num?: string, messageText?: string) => {
    const targetNum = num || waNumber;
    const msg = messageText || waMessage;

    // Sanitize number - remove any spaces or non-digit characters
    const cleanNum = targetNum ? targetNum.replace(/\D/g, "") : "";
    const waUrl = cleanNum 
      ? `https://api.whatsapp.com/send?phone=${cleanNum}&text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    
    if (cleanNum) {
      addLog(`Establishing secure WhatsApp gateway stream to: +${cleanNum}`, "success");
    } else {
      addLog(`Opening WhatsApp Gateway for manual contact selection.`, "info");
    }
    jervisSynth.playConfirm();
    
    // Deep links work natively inside Android/iOS webviews and browsers
    window.open(waUrl, "_blank");
  };

  // Handle Jervis Actions matching specific voice triggers
  const executeLocalAction = async (commandText: string): Promise<boolean> => {
    const cmd = commandText.toLowerCase();

    // 1. Flashlight Control (Support English + Bengali triggers)
    if (
      cmd.includes("flashlight") || 
      cmd.includes("torch") || 
      cmd.includes("light") || 
      cmd.includes("ফ্ল্যাশলাইট") || 
      cmd.includes("লাইট") || 
      cmd.includes("আলো")
    ) {
      const isOff = 
        cmd.includes("off") || 
        cmd.includes("stop") || 
        cmd.includes("deactivate") || 
        cmd.includes("bondho") || 
        cmd.includes("বন্ধ") || 
        cmd.includes("নেভাও") || 
        cmd.includes("নেভাতে");
        
      const active = !isOff;
      toggleFlashlight(active);
      
      const reply = active 
        ? "Flashlight has been engaged successfully, Sir. Illuminating dark sectors. ফ্ল্যাশলাইট চালু করা হয়েছে, স্যার।"
        : "Flashlight deactivated, Sir. Returning to dark-vision mode. ফ্ল্যাশলাইট বন্ধ করা হয়েছে, স্যার।";
      
      setMessages(prev => [...prev, {
        sender: "jervis",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      speakResponse(reply);
      return true;
    }

    // 2. WhatsApp Communications (Support English + Bengali triggers)
    if (
      cmd.includes("whatsapp") || 
      cmd.includes("messag") || 
      cmd.includes("হোয়াটসঅ্যাপ") || 
      cmd.includes("মেসেজ") || 
      cmd.includes("বার্তা")
    ) {
      let phone = waNumber || "";
      let name = "Secure Gateway Contact";
      let msgText = waMessage || "Initiating Stark communication protocol.";

      const isNative = typeof window !== "undefined" && (window as any).Capacitor && (window as any).Capacitor.isNative;

      if (isNative) {
        try {
          const { Contacts } = await import('@capgo/capacitor-contacts');
          const permission = await Contacts.requestPermissions();
          if (permission.contacts === 'granted') {
            const contactsResult = await Contacts.getContacts({
              projection: { name: true, phones: true }
            });
            if (contactsResult.contacts) {
              let bestMatch = null;
              for (const c of contactsResult.contacts) {
                const cName = (c.name?.display || "").toLowerCase();
                if (cName && cName.length > 2 && cmd.includes(cName)) {
                  if (!bestMatch || cName.length > (bestMatch.name?.display?.length || 0)) {
                    bestMatch = c;
                  }
                }
              }

              if (!bestMatch) {
                for (const c of contactsResult.contacts) {
                  const firstName = (c.name?.given || "").toLowerCase();
                  if (firstName && firstName.length > 2 && cmd.includes(firstName)) {
                    bestMatch = c;
                    break;
                  }
                }
              }

              if (bestMatch && bestMatch.phones && bestMatch.phones.length > 0) {
                 phone = bestMatch.phones[0].number || "";
                 name = bestMatch.name?.display || "Contact";
                 
                 let tempMsg = cmd.replace(name.toLowerCase(), "").replace((bestMatch.name?.given || "").toLowerCase(), "");
                 tempMsg = tempMsg.replace(/whatsapp|message|saying|to|ke|koro|on|send|পাঠাও|বল|bulo|বলছে/gi, "").trim();
                 if (tempMsg.length > 0) {
                    msgText = tempMsg;
                 }
              }
            }
          }
        } catch (e) {
          console.error("Contacts error", e);
        }
      }

      if (!phone) {
        if (cmd.includes("pepper") || cmd.includes("পেপার")) {
          phone = "919900000001";
          name = "Pepper Potts";
          msgText = "Sir requires your presence in the Laboratory immediately.";
        } else if (cmd.includes("happy") || cmd.includes("হ্যাপি")) {
          phone = "919900000002";
          name = "Happy Hogan";
          msgText = "Sir requires the transport vehicle pre-warmed.";
        } else if (cmd.includes("tony") || cmd.includes("টনি")) {
          phone = "919876543210";
          name = "Tony Stark";
        }
      }

      openWhatsApp(phone, msgText);
      
      const reply = phone 
        ? `Establishing secure WhatsApp communications to ${name}, Sir. হোয়াটসঅ্যাপ কানেকশন চালু করা হচ্ছে, স্যার।`
        : `Opening WhatsApp Gateway. Please select a contact manually, Sir. হোয়াটসঅ্যাপ খোলা হচ্ছে।`;
        
      setMessages(prev => [...prev, {
        sender: "jervis",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      speakResponse(reply);
      return true;
    }

    // 3. Cybernetic Defense Shield
    if (cmd.includes("shield") || cmd.includes("defend") || cmd.includes("protective bubble") || cmd.includes("ঢাল")) {
      const active = cmd.includes("on") || cmd.includes("activate") || cmd.includes("engage") || !shieldActive;
      setShieldActive(active);
      jervisSynth.playConfirm();
      addLog(`Cybernetic defense shields: ${active ? "ENGAGED" : "DISENGAGED"}`, active ? "success" : "warn");
      
      const reply = active 
        ? "Defensive energy barriers are locked and fully energized, Sir. Shield stability standing at maximum threshold."
        : "Defensive barriers deactivated. We are running in low-profile diagnostic mode, Sir.";
      
      setMessages(prev => [...prev, {
        sender: "jervis",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      speakResponse(reply);
      return true;
    }

    // 4. Overdrive Mode
    if (cmd.includes("overdrive") || cmd.includes("supercharge") || cmd.includes("reactor boost") || cmd.includes("ওভারড্রাইভ")) {
      const active = cmd.includes("on") || cmd.includes("activate") || cmd.includes("engage") || !reactorOverdrive;
      setReactorOverdrive(active);
      if (active) {
        jervisSynth.playAlert();
        addLog("CRITICAL: Arc Reactor switched to Overdrive Mode! Output surging!", "warn");
      } else {
        jervisSynth.playConfirm();
        addLog("Arc Reactor returned to safe standard operation parameters", "success");
      }
      
      const reply = active
        ? "Warning, Sir. Reactor core output is surging past one hundred and forty percent. Armor physical integrity is optimal, but heat dissipation coils are taxed."
        : "Understood, Sir. Cooling grid engaged. Core reactor outputs returning to safe standard parameters.";
      
      setMessages(prev => [...prev, {
        sender: "jervis",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      speakResponse(reply);
      return true;
    }

    // 5. Diagnostics
    if (
      cmd.includes("diagnose") || 
      cmd.includes("system check") || 
      cmd.includes("diagnostics") || 
      cmd.includes("scan suit") || 
      cmd.includes("ডায়াগনস্টিক") || 
      cmd.includes("স্ক্যান")
    ) {
      runSystemDiagnostics();
      return true;
    }

    // 6. Generic App Launcher
    const openMatch = cmd.match(/open (.*)/) || cmd.match(/launch (.*)/) || cmd.match(/(.*) kholo/) || cmd.match(/(.*) খোলো/);
    if (openMatch && !cmd.includes("whatsapp")) { // Handled separately
      const appName = openMatch[1].trim().toLowerCase();
      
      let intentUrl = `https://www.google.com/search?q=${appName}`;
      
      const isNative = typeof window !== "undefined" && (window as any).Capacitor && (window as any).Capacitor.isNative;

      if (isNative) {
        if (appName.includes("youtube")) intentUrl = "intent://www.youtube.com/#Intent;package=com.google.android.youtube;scheme=https;end;";
        else if (appName.includes("facebook")) intentUrl = "intent://#Intent;package=com.facebook.katana;scheme=fb;end;";
        else if (appName.includes("instagram")) intentUrl = "intent://#Intent;package=com.instagram.android;scheme=instagram;end;";
        else if (appName.includes("map") || appName.includes("ম্যাপ")) intentUrl = "intent://#Intent;package=com.google.android.apps.maps;scheme=geo;end;";
        else if (appName.includes("camera") || appName.includes("ক্যামেরা")) intentUrl = "intent://#Intent;action=android.media.action.IMAGE_CAPTURE;end;";
        else if (appName.includes("chrome") || appName.includes("browser")) intentUrl = "intent://#Intent;package=com.android.chrome;scheme=https;end;";
        else if (appName.includes("spotify")) intentUrl = "intent://#Intent;package=com.spotify.music;scheme=spotify;end;";
        else if (appName.includes("play store") || appName.includes("store")) intentUrl = "intent://#Intent;package=com.android.vending;scheme=market;end;";
        else if (appName.includes("gmail") || appName.includes("mail") || appName.includes("মেইল")) intentUrl = "intent://#Intent;package=com.google.android.gm;scheme=mailto;end;";
        else if (appName.includes("phone") || appName.includes("call") || appName.includes("কল")) intentUrl = "intent://#Intent;action=android.intent.action.DIAL;end;";
        else if (appName.includes("calculator") || appName.includes("ক্যালকুলেটর")) intentUrl = "intent://#Intent;package=com.google.android.calculator;end;";
        else if (appName.includes("clock") || appName.includes("alarm") || appName.includes("অ্যালার্ম")) intentUrl = "intent://#Intent;package=com.google.android.deskclock;end;";
      } else {
        if (appName.includes("youtube")) intentUrl = "https://www.youtube.com";
        else if (appName.includes("facebook")) intentUrl = "https://www.facebook.com";
        else if (appName.includes("instagram")) intentUrl = "https://www.instagram.com";
        else if (appName.includes("map")) intentUrl = "https://maps.google.com";
        else if (appName.includes("spotify")) intentUrl = "https://open.spotify.com";
        else if (appName.includes("gmail") || appName.includes("mail")) intentUrl = "https://mail.google.com";
      }

      window.open(intentUrl, "_blank");
      
      const reply = `Launching ${appName}, Sir.`;
      setMessages(prev => [...prev, {
        sender: "jervis",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      speakResponse(reply);
      return true;
    }

    // 7. App Exit
    if (cmd.includes("close app") || cmd.includes("bondho koro") || cmd.includes("exit app") || cmd.includes("বন্ধ করো") || cmd.includes("shutdown") || cmd.includes("shut down")) {
      const reply = `Shutting down main interface, Sir. Goodbye.`;
      setMessages(prev => [...prev, {
        sender: "jervis",
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      speakResponse(reply);
      setTimeout(() => {
        if (Capacitor.isNative) {
          import("@capacitor/app").then(({ App }) => App.exitApp());
        } else {
          window.close();
        }
      }, 2000);
      return true;
    }

    // 8. Reset Screen
    if (cmd.includes("clear console") || cmd.includes("clear memory") || cmd.includes("reset screen") || cmd.includes("ক্লিয়ার")) {
      setMessages([{
        sender: "jervis",
        text: "Command console cleared, Sir. Grid coordinates standing clear.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      jervisSynth.playConfirm();
      addLog("Command console and transcript memory flushed", "info");
      return true;
    }

    return false;
  };

  // Trigger automated full diagnostic sweep
  const runSystemDiagnostics = () => {
    if (diagnosticProgress !== null) return;
    
    jervisSynth.playSystemScan();
    setDiagnosticProgress(0);
    addLog("Initiating Level 5 system-wide sweep...", "warn");
    
    speakResponse("Initiating full cybernetic suite diagnostic scan. Please hold, Sir.");

    const interval = setInterval(() => {
      setDiagnosticProgress(prev => {
        if (prev === null) {
          clearInterval(interval);
          return null;
        }
        if (prev >= 100) {
          clearInterval(interval);
          setDiagnosticProgress(null);
          jervisSynth.playConfirm();
          addLog("Diagnostics complete. Zero systemic anomalies detected", "success");
          
          const diagnosisReport = "Suit diagnostics complete, Sir. Central power cores are stabilized, kinetic dampers are perfectly calibrated, and micro-thruster stabilization is operating at peak efficiency.";
          setMessages(prevMsgs => [...prevMsgs, {
            sender: "jervis",
            text: diagnosisReport,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          speakResponse(diagnosisReport);
          return null;
        }
        
        // incremental log details
        if (prev === 20) addLog("Scanning flight control micro-thrusters... [PASS]", "info");
        if (prev === 50) addLog("Probing cybernetic logic nodes and sub-routines... [PASS]", "info");
        if (prev === 80) addLog("Analyzing cognitive network bridges and firewall integrity... [PASS]", "info");
        
        return prev + 10;
      });
    }, 400);
  };

  // Send message protocol to Backend / Gemini Model
  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || chatInput;
    if (!rawText.trim()) return;

    jervisSynth.playBeep(600, "sine", 0.05, 0.03);

    // Render User message
    const userMessage: Message = {
      sender: "user",
      text: rawText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsThinking(true);
    isThinkingRef.current = true; // Synchronous ref set for robust race prevention
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    addLog(`Sent command stream: "${rawText.trim()}"`, "info");

    // Check if it's a local command execution
    const isLocalCommand = await executeLocalAction(rawText.trim());
    if (isLocalCommand) {
      setIsThinking(false);
      isThinkingRef.current = false;
      return;
    }

    try {
      // Send chat history so JARVIS maintains complete context
      const chatHistoryForAPI = [...messages, userMessage].map(m => ({
        sender: m.sender === "jervis" ? "jervis" : "user",
        text: m.text
      }));

      const savedApiKey = localStorage.getItem("jervis_gemini_api_key") || "";
      let jervisReplyText = "";

      const isNative = typeof window !== "undefined" && (window as any).Capacitor && (window as any).Capacitor.isNative;

      if (isNative || savedApiKey) {
        if (!savedApiKey) {
           jervisReplyText = "I am currently running in offline simulation mode, Sir. To enable full cognitive functions, please configure my neural matrix with a valid GEMINI_API_KEY in the Settings tab of my HUD console.";
           addLog("Neural matrix offline. API Key missing.", "warn");
        } else {
           // REST API Direct Fallback for Android/APK
           const formattedContents = chatHistoryForAPI.map((m: any) => ({
             role: m.sender === "user" ? "user" : "model",
             parts: [{ text: m.text }]
           }));

           const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${savedApiKey}`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({
               contents: formattedContents,
               systemInstruction: {
                 parts: [{ text: "You are JARVIS, the highly sophisticated British AI voice assistant built by Tony Stark. Your speech is elegant, refined, witty, and deeply loyal. You always refer to the user as 'Sir' or 'Ma'am'. Keep responses brief, punchy, and highly conversational (no lists). You have direct control over hardware protocols: Flashlight/Torch (can be toggled on/off) and WhatsApp Communications Gateway (which launches direct message draft protocols). If the user speaks in Bengali or requests Bengali assistance, respond in an elegant, polite, butler-like Bengali-English blend (e.g. 'অবশ্যই স্যার, ফ্ল্যাশলাইট প্রোটোকল সচল করছি' or 'নিশ্চয়ই স্যার, হোয়াটসঅ্যাপ ডেকের সাথে সংযোগ স্থাপন করা হচ্ছে।'). Always stay in character as a brilliant assistant." }]
               },
               generationConfig: { temperature: 0.8 }
             })
           });

           if (!response.ok) {
              const errData = await response.json().catch(() => ({}));
              throw new Error(errData.error?.message || "Cognitive response gateway offline.");
           }
           
           const data = await response.json();
           jervisReplyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I was unable to parse that frequency, Sir.";
        }
      } else {
        const reqHeaders: Record<string, string> = {
          "Content-Type": "application/json"
        };
        
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: reqHeaders,
          body: JSON.stringify({ messages: chatHistoryForAPI }),
        });

        // Catch the HTML fallback error gracefully
        const textResponse = await response.text();
        if (textResponse.trim().startsWith("<")) {
          throw new Error("Backend server is currently offline or unreachable. Please configure your API key in Settings to run in standalone device mode.");
        }

        const data = JSON.parse(textResponse);
        if (!response.ok || data.error) {
          throw new Error(data.error || "Cognitive response gateway offline.");
        }
        
        jervisReplyText = data.text || "I was unable to parse that frequency, Sir.";
      }

      setIsThinking(false);
      isThinkingRef.current = false;

      // Add Jervis Response
      const jervisMessage: Message = {
        sender: "jervis",
        text: jervisReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, jervisMessage]);
      addLog("Received verbal cognitive packet from AI core", "success");
      speakResponse(jervisReplyText);

    } catch (err: any) {
      console.error(err);
      setIsThinking(false);
      isThinkingRef.current = false;
      addLog(`Network Link Exception: ${err.message}`, "error");
      
      const failText = "Pardon me, Sir, but my link with the primary server is currently failing. Offline localized scripts are active.";
      setMessages(prev => [...prev, {
        sender: "jervis",
        text: failText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      speakResponse(failText);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a14] text-[#8fa2c4] font-mono flex flex-col relative overflow-hidden select-none">
      {/* Holographic Security PIN Lock overlay */}
      {pinLockActive && !appUnlocked && (
        <div className="fixed inset-0 bg-[#040915]/95 z-[9999] flex flex-col items-center justify-center p-4 backdrop-blur-lg">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,37,70,0.6),rgba(4,9,21,1))] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(14,26,45,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(14,26,45,0.04)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-[#081226]/90 border border-[#1d4c8c] rounded-2xl p-6 shadow-[0_0_40px_rgba(0,255,204,0.1)] relative z-10 flex flex-col items-center"
          >
            <div className="h-14 w-14 rounded-full bg-[#0e2142] border border-[#215194] flex items-center justify-center text-[#00ffcc] mb-4 shadow-[0_0_20px_rgba(0,255,200,0.25)]">
              <Lock className="h-6 w-6 animate-pulse" />
            </div>
            
            <h2 className="text-sm font-black tracking-widest text-[#e2f1ff] uppercase text-center">
              SYSTEM LOCKDOWN ACTIVE
            </h2>
            <p className="text-[10px] text-[#5e7ea8] tracking-widest uppercase mb-6 text-center">
              Authentication protocol requested
            </p>
            
            <div className="w-full space-y-4">
              <div className="relative">
                <input 
                  type="password"
                  placeholder="ENTER ACCESS SECURITY PIN..."
                  maxLength={6}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const inputPin = (e.target as HTMLInputElement).value;
                      if (!pinCode || inputPin === pinCode) {
                        setAppUnlocked(true);
                        addLog("Identity authenticated. Biometrics matches owner record.", "success");
                        jervisSynth.playConfirm();
                      } else {
                        addLog("Access Refused! Security mismatch.", "error");
                        jervisSynth.playAlert();
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                  className="w-full bg-[#040813] border border-[#1d4c8c] focus:border-[#00ffcc] text-center text-[#00ffcc] tracking-widest font-black text-sm rounded-xl py-3 placeholder-[#31507d] focus:outline-none transition-colors"
                  autoFocus
                />
              </div>
              
              <p className="text-[8px] text-[#4ea0ff] text-center uppercase tracking-wide">
                Press ENTER to verify encryption code
              </p>

              {pinCode && (
                <div className="text-center">
                  <span className="text-[8px] text-amber-500/80 font-bold uppercase tracking-wider">
                    Secured by 256-bit stark passcode
                  </span>
                </div>
              )}
              
              {!pinCode && (
                <div className="text-center p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                  <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider block">
                    No Security PIN Configured Yet
                  </span>
                  <span className="text-[8px] text-[#5e7ea8] mt-0.5 block">
                    Enter any code to access HUD, then configure a permanent PIN in Security tab.
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Immersive Cybergrid background effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,37,70,0.5),rgba(7,10,20,1))] z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,26,45,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,26,45,0.05)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />

      {/* Holographic Front Screen Torch Ambient Emitted Light fallback */}
      <AnimatePresence>
        {flashlightOn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,248,220,0.22),transparent_85%)] border-[12px] border-amber-400/10 z-[45] shadow-[inset_0_0_80px_rgba(255,230,150,0.15)]"
          />
        )}
      </AnimatePresence>

      {/* Holographic glowing scan lines overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_4px,3px_100%] z-40 opacity-40" />

      {/* Futuristic HUD Header */}
      <header className="border-b border-[#152e52]/45 bg-[#0a1124]/75 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-9 w-9 rounded-lg bg-[#0e2142] border border-[#215194] flex items-center justify-center text-[#40c3ff] shadow-[0_0_15px_rgba(64,195,255,0.2)] animate-pulse">
                <Cpu className="h-5 w-5" />
              </div>
              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest text-[#e2f1ff] uppercase">
                JERVIS <span className="text-[#36b7ff] text-xs font-normal tracking-normal lowercase">v10.4.8</span>
              </h1>
              <p className="text-[10px] text-[#4ea0ff] font-bold tracking-wider uppercase opacity-85">
                Cybernetic AI System Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status light */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#09152b] border border-[#163461] rounded-full text-[10px] font-bold text-[#3cc0ff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00ffcc] animate-ping" />
              <span>STARK SECURITY GATEWAY</span>
            </div>

            {/* Mute Button */}
            <button
              onClick={async () => {
                const nextMuted = !isMuted;
                setIsMuted(nextMuted);
                jervisSynth.muted = nextMuted;
                jervisSynth.playBeep(800, "sine", 0.05, 0.03);
                if (nextMuted) {
                  const isNative = typeof window !== "undefined" && (window as any).Capacitor && (window as any).Capacitor.isNative;
                  if (isNative) {
                    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
                    await TextToSpeech.stop().catch(() => {});
                  } else {
                    window.speechSynthesis.cancel();
                  }
                  setIsSpeaking(false);
                }
              }}
              className={`p-2.5 rounded-lg border transition-all ${
                !isMuted
                  ? "bg-[#0c1e3a] text-[#44d3ff] border-[#1d4c8c] hover:bg-[#132c54]"
                  : "bg-[#181824] text-[#717182] border-[#2c2c3d]"
              }`}
              title={isMuted ? "Enable Voice Feedback" : "Mute Jervis Voice"}
            >
              {!isMuted ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main HUD Display Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 items-stretch z-10 relative">
        
        {/* LEFT COLUMN: Highly advanced holographic Arc Reactor Core & Direct Actions (42%) */}
        <div className="w-full lg:w-[42%] flex flex-col gap-6 shrink-0">
          
          {/* Arc Reactor Compartment */}
          <div className="bg-[#091122]/90 border border-[#14325c]/60 rounded-xl p-6 flex flex-col items-center justify-between relative shadow-[0_4px_30px_rgba(0,0,0,0.4)] overflow-hidden">
            <div className="absolute top-2 left-3 text-[9px] uppercase tracking-wider text-[#358cf5] font-bold">
              SYS_REACTOR_CORE_MATRIX
            </div>
            
            {/* Active scanner sweep line overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(64,195,255,0.06)_50%)] bg-[size:100%_20px] pointer-events-none animate-[scan_6s_linear_infinite]" />

            {/* Arc Reactor interactive SVG visualization */}
            <div className="relative my-8 group cursor-pointer" onClick={toggleListening}>
              
              {/* Pulsing ring aura */}
              <div className={`absolute -inset-8 rounded-full transition-all duration-700 pointer-events-none ${
                isListening 
                  ? "bg-[radial-gradient(circle,rgba(255,90,40,0.15),transparent_65%)] shadow-[0_0_50px_rgba(255,90,40,0.2)] animate-pulse"
                  : isSpeaking
                  ? "bg-[radial-gradient(circle,rgba(64,195,255,0.2),transparent_65%)] shadow-[0_0_50px_rgba(64,195,255,0.35)] animate-pulse"
                  : "bg-[radial-gradient(circle,rgba(0,255,200,0.05),transparent_65%)] group-hover:bg-[radial-gradient(circle,rgba(64,195,255,0.1),transparent_65%)]"
              }`} />

              {/* Glowing SVG Reactor Core */}
              <svg 
                className={`w-64 h-64 select-none relative transition-transform duration-300 transform group-hover:scale-102`} 
                viewBox="0 0 200 200"
              >
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="hyper-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Outer concentric tech notches */}
                <circle 
                  cx="100" cy="100" r="92" 
                  stroke="#102545" strokeWidth="1.5" fill="none" strokeDasharray="5,15"
                  className={reactorOverdrive ? "animate-[spin_4s_linear_infinite]" : "animate-[spin_20s_linear_infinite]"}
                />

                {/* Second concentric segment ring */}
                <circle 
                  cx="100" cy="100" r="82" 
                  stroke={reactorOverdrive ? "#ff6230" : isListening ? "#ff5a28" : "#2461b5"} 
                  strokeWidth="2.5" fill="none" strokeDasharray="40,20,10,20"
                  className={reactorOverdrive ? "animate-[spin_2s_linear_infinite]" : "animate-[spin_10s_linear_infinite_reverse]"}
                  filter="url(#glow)"
                />

                {/* Grid measurement dots */}
                <circle cx="100" cy="100" r="70" stroke="#0e2345" strokeWidth="1" fill="none" strokeDasharray="2,6" />

                {/* Power segment copper coils (JARVIS classic sectors) */}
                <g className={reactorOverdrive ? "animate-[spin_1.5s_linear_infinite]" : "animate-[spin_15s_linear_infinite]"}>
                  {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((angle, i) => (
                    <g key={i} transform={`rotate(${angle} 100 100)`}>
                      <rect 
                        x="93" y="18" width="14" height="12" rx="2"
                        fill="#070a14" 
                        stroke={reactorOverdrive ? "#ff7c4d" : isSpeaking ? "#4cd3ff" : "#24b2ff"} 
                        strokeWidth="1.5"
                        filter="url(#glow)"
                        className="opacity-90"
                      />
                      <line x1="100" y1="18" x2="100" y2="30" stroke="#3bc0ff" strokeWidth="1" opacity="0.6" />
                    </g>
                  ))}
                </g>

                {/* Secondary inner spinner */}
                <circle 
                  cx="100" cy="100" r="50" 
                  stroke={isListening ? "#ff5a28" : isSpeaking ? "#4cd3ff" : "#00ffcc"} 
                  strokeWidth="1" fill="none" strokeDasharray="30,10"
                  className="animate-[spin_5s_linear_infinite_reverse]"
                />

                {/* Core glass ring shadow */}
                <circle cx="100" cy="100" r="38" fill="#091122" stroke="#1d4d8c" strokeWidth="2" />

                {/* Central triangular reactor element */}
                <polygon 
                  points="100,75 122,112 78,112" 
                  fill={isListening ? "url(#orange-grad)" : isSpeaking ? "url(#blue-grad)" : "url(#cyan-grad)"} 
                  stroke={isListening ? "#ff5a28" : isSpeaking ? "#00e5ff" : "#00ffcc"}
                  strokeWidth="2.5"
                  filter="url(#hyper-glow)"
                  className="animate-pulse"
                />

                {/* Central energy node */}
                <circle 
                  cx="100" cy="100" r="14" 
                  fill="#ffffff" 
                  filter="url(#glow)"
                />

                {/* SVG Color Gradients */}
                <defs>
                  <linearGradient id="cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#00ffcc" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3bc0ff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0072ff" stopOpacity="0.8" />
                  </linearGradient>
                  <linearGradient id="orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff9900" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ff5a28" stopOpacity="0.8" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Centered micro overlay when listening */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <AnimatePresence mode="wait">
                  {isListening ? (
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="bg-red-500/10 p-4 rounded-full border border-red-500/50"
                    >
                      <MicOff className="h-6 w-6 text-red-500 animate-pulse" />
                    </motion.div>
                  ) : isSpeaking ? (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="bg-[#00f0ff]/10 p-4 rounded-full border border-[#00f0ff]/40"
                    >
                      <Activity className="h-6 w-6 text-[#00f0ff] animate-bounce" />
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="bg-[#00ffcc]/10 p-4 rounded-full border border-[#00ffcc]/30 group-hover:border-[#00ffcc]/60 transition-colors"
                    >
                      <Mic className="h-6 w-6 text-[#00ffcc] group-hover:scale-110 transition-transform" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Vocal Speech Subtitle box */}
            <div className="w-full text-center px-4 mb-2">
              <AnimatePresence mode="wait">
                {isListening ? (
                  <motion.p 
                    key="listening"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-orange-500 font-bold tracking-wider animate-pulse uppercase"
                  >
                    {transcript || "Listening..."}
                  </motion.p>
                ) : isSpeaking ? (
                  <motion.p 
                    key="speaking"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-[#00e5ff] font-bold tracking-wider animate-pulse uppercase"
                  >
                    Vocal Synthesis Streaming...
                  </motion.p>
                ) : (
                  <motion.p 
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-[#5278ad] tracking-wide"
                  >
                    Tap core to initiate voice command
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Subsystem Multi-Tab diagnostics */}
          <div className="bg-[#091122]/90 border border-[#14325c]/60 rounded-xl p-5 flex-1 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
            <div className="grid grid-cols-3 gap-1.5 border-b border-[#14325c]/60 mb-4 pb-2 text-[10px]">
              <button 
                onClick={() => { setSelectedActionTab('diagnostics'); jervisSynth.playBeep(900, "sine", 0.05, 0.02); }}
                className={`px-1 py-1.5 rounded font-bold tracking-wider uppercase text-center transition-all ${selectedActionTab === 'diagnostics' ? 'text-[#3bc0ff] bg-[#112347] border border-[#3bc0ff]/20' : 'text-[#536b94] hover:text-[#8ba7d4] border border-transparent'}`}
              >
                Suit Systems
              </button>
              <button 
                onClick={() => { setSelectedActionTab('hardware'); jervisSynth.playBeep(900, "sine", 0.05, 0.02); }}
                className={`px-1 py-1.5 rounded font-bold tracking-wider uppercase text-center transition-all ${selectedActionTab === 'hardware' ? 'text-[#3bc0ff] bg-[#112347] border border-[#3bc0ff]/20' : 'text-[#536b94] hover:text-[#8ba7d4] border border-transparent'}`}
              >
                Device HUD
              </button>
              <button 
                onClick={() => { setSelectedActionTab('settings'); jervisSynth.playBeep(900, "sine", 0.05, 0.02); }}
                className={`px-1 py-1.5 rounded font-bold tracking-wider uppercase text-center transition-all ${selectedActionTab === 'settings' ? 'text-[#3bc0ff] bg-[#112347] border border-[#3bc0ff]/20' : 'text-[#536b94] hover:text-[#8ba7d4] border border-transparent'}`}
              >
                Settings
              </button>
            </div>

            <div className="flex-1">
              <AnimatePresence mode="wait">
                {selectedActionTab === "diagnostics" && (
                  <motion.div 
                    key="diagnostics"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#153463]"
                  >
                    {/* Stat Item */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="flex items-center gap-1.5 text-[#5e7ea8]">
                          <Zap className="h-3.5 w-3.5 text-[#00ffcc]" /> 
                          Arc Reactor Output
                        </span>
                        <span className={`${reactorOverdrive ? "text-orange-500" : "text-[#00ffcc]"}`}>{reactorOutput}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#070e1b] rounded-full overflow-hidden border border-[#16305a]/45">
                        <motion.div 
                          className={`h-full rounded-full ${reactorOverdrive ? "bg-orange-500" : "bg-[#00ffcc]"}`}
                          animate={{ width: `${Math.min(100, (reactorOutput / 150) * 100)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Stat Item */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="flex items-center gap-1.5 text-[#5e7ea8]">
                          <Activity className="h-3.5 w-3.5 text-orange-500" />
                          Core Temperature
                        </span>
                        <span className={reactorOverdrive ? "text-red-500 animate-pulse" : "text-amber-500"}>{coreTemp}°C</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#070e1b] rounded-full overflow-hidden border border-[#16305a]/45">
                        <motion.div 
                          className={`h-full rounded-full ${reactorOverdrive ? "bg-red-500" : "bg-amber-500"}`}
                          animate={{ width: `${Math.min(100, (coreTemp / 110) * 100)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>

                    {/* Tech details grid */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-2">
                      <div className="bg-[#0b162c] border border-[#1d4078]/45 rounded-lg p-2.5 flex items-center gap-2">
                        <Shield className={`h-4.5 w-4.5 shrink-0 ${shieldActive ? "text-[#00ffcc]" : "text-[#476085]"}`} />
                        <div>
                          <div className="text-[9px] uppercase font-bold text-[#5675a3]">Def-Shields</div>
                          <div className={`text-[10px] font-bold ${shieldActive ? "text-[#00ffcc]" : "text-[#476085]"}`}>
                            {shieldActive ? "SECURED (100%)" : "OFFLINE"}
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#0b162c] border border-[#1d4078]/45 rounded-lg p-2.5 flex items-center gap-2">
                        <RefreshCw className={`h-4.5 w-4.5 shrink-0 text-[#3ac0ff] ${diagnosticProgress !== null ? "animate-spin" : ""}`} />
                        <div>
                          <div className="text-[9px] uppercase font-bold text-[#5675a3]">Diagnostics</div>
                          <div className="text-[10px] font-bold text-[#3ac0ff]">
                            {diagnosticProgress !== null ? `SCANNING (${diagnosticProgress}%)` : "IDLE / STABLE"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Integrated system parameters */}
                    <div className="space-y-1.5 mt-2 pt-2 border-t border-[#14325c]/30">
                      <div className="p-2 rounded bg-[#040914] border border-[#1d4c8c]/35 flex justify-between">
                        <span className="font-bold text-[#5675a3] text-[9px] uppercase">COGNITIVE BACKEND</span>
                        <span className="text-[#00ffcc] font-extrabold text-[9px]">{activeProvider} [ACTIVE]</span>
                      </div>
                      <div className="p-2 rounded bg-[#040914] border border-[#1d4c8c]/35 flex justify-between">
                        <span className="font-bold text-[#5675a3] text-[9px] uppercase">WAKE WORD STATE</span>
                        <span className="text-[#3bc0ff] font-extrabold text-[9px]">LOCKED ("{memory.userPrefs.wakeWord}")</span>
                      </div>
                    </div>

                    {/* Vocal Command Glossary integrated into Diagnostics view */}
                    <div className="p-2.5 bg-[#0c1e3a]/45 border border-[#16335f] rounded-lg mt-2">
                      <div className="font-bold text-[#00ffcc] text-[10px] uppercase tracking-wider mb-1">
                        Vocal Command Glossary (ভয়েস গাইড)
                      </div>
                      <p className="text-[9px] text-[#5e7ea8] mb-2 leading-relaxed">
                        Tap the reactor core and speak these command strings directly:
                      </p>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between p-1 bg-[#050b16] rounded border border-[#14325c]/40 text-[9px]">
                          <span className="font-semibold text-[#3bc0ff]">"Open YouTube" / "YouTube খোলো"</span>
                          <span className="text-emerald-400 font-bold uppercase">Open App</span>
                        </div>
                        <div className="flex justify-between p-1 bg-[#050b16] rounded border border-[#14325c]/40 text-[9px]">
                          <span className="font-semibold text-[#3bc0ff]">"Close App" / "বন্ধ করো"</span>
                          <span className="text-amber-500 font-bold uppercase">Exit JARVIS</span>
                        </div>
                        <div className="flex justify-between p-1 bg-[#050b16] rounded border border-[#14325c]/40 text-[9px]">
                          <span className="font-semibold text-[#3bc0ff]">"Turn on Flashlight" / "আলো জ্বালো"</span>
                          <span className="text-emerald-400 font-bold uppercase">Flash On</span>
                        </div>
                        <div className="flex justify-between p-1 bg-[#050b16] rounded border border-[#14325c]/40 text-[9px]">
                          <span className="font-semibold text-[#3bc0ff]">"Open WhatsApp" / "হোয়াটসঅ্যাপ খোলো"</span>
                          <span className="text-emerald-400 font-bold uppercase">Launch WA</span>
                        </div>
                        <div className="flex justify-between p-1 bg-[#050b16] rounded border border-[#14325c]/40 text-[9px]">
                          <span className="font-semibold text-[#3bc0ff]">"Scan Diagnostics" / "স্ক্যান করো"</span>
                          <span className="text-[#3bc0ff] font-bold uppercase">Diagnostics</span>
                        </div>
                        <div className="flex justify-between p-1 bg-[#050b16] rounded border border-[#14325c]/40 text-[9px]">
                          <span className="font-semibold text-[#3bc0ff]">"Shield bubble on" / "শিল্ড চালু করো"</span>
                          <span className="text-emerald-400 font-bold uppercase">Shield On</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedActionTab === "hardware" && (
                  <motion.div 
                    key="hardware"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  >
                    <HardwareTab 
                      flashlightOn={flashlightOn}
                      toggleFlashlight={toggleFlashlight}
                      addLog={addLog}
                      playBeep={(freq, type, duration, gainValue) => jervisSynth.playBeep(freq, type, duration, gainValue)}
                      playConfirm={() => jervisSynth.playConfirm()}
                      waNumber={waNumber}
                      setWaNumber={setWaNumber}
                      waMessage={waMessage}
                      setWaMessage={setWaMessage}
                      openWhatsApp={openWhatsApp}
                    />
                  </motion.div>
                )}


                {selectedActionTab === "settings" && (
                  <SettingsTab 
                    addLog={addLog}
                    playBeep={(freq, type, duration, gainValue) => jervisSynth.playBeep(freq, type, duration, gainValue)}
                    playConfirm={() => jervisSynth.playConfirm()}
                    activeProvider={activeProvider}
                    setActiveProvider={setActiveProvider}
                    memory={memory}
                    setMemory={setMemory}
                    pinCode={pinCode}
                    setPinCode={setPinCode}
                    pinLockActive={pinLockActive}
                    setPinLockActive={setPinLockActive}
                    privacyMode={privacyMode}
                    setPrivacyMode={setPrivacyMode}
                  />
                )}
              </AnimatePresence>
            </div>

            {diagnosticProgress !== null && (
              <div className="mt-4 pt-2 border-t border-[#14325c]/30">
                <div className="flex justify-between text-[10px] uppercase font-bold text-[#e15a1a] mb-1">
                  <span>Level 5 diagnostic sweep in progress...</span>
                  <span>{diagnosticProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#070e1b] rounded-full overflow-hidden border border-orange-500/20">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 w-full animate-[progress_15s_linear_infinite]" style={{ width: `${diagnosticProgress}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Chat console transcript, logs, and custom terminal interface (58%) */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Main Visual conversation terminal */}
          <div className="bg-[#091122]/90 border border-[#14325c]/60 rounded-xl p-5 flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)] h-[350px] md:h-[420px] relative">
            <div className="flex items-center justify-between border-b border-[#14325c]/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#3bc0ff] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#3bc0ff]">
                  COGNITIVE_INTELLIGENCE_STREAM
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#4471aa]">SECURE DIALOGUE MODE</span>
            </div>

            {/* Message transcript container */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs scrollbar-thin scrollbar-thumb-[#153463]">
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-[#426a9a] mb-1">
                    <span>{m.sender === "user" ? "USER_AUTH_SESSION" : "JERVIS_COGNITIVE"}</span>
                    <span>•</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <div className={`p-3 rounded-lg max-w-[85%] border leading-relaxed ${
                    m.sender === "user" 
                      ? "bg-[#112347]/50 text-[#9cd8ff] border-[#224c8c]/50" 
                      : "bg-[#0c1a33]/60 text-[#dfecff] border-[#163663]"
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-[#426a9a] mb-1">
                    <span>JERVIS_COGNITIVE</span>
                    <span>•</span>
                    <span>ANALYZING MATRIX...</span>
                  </div>
                  <div className="p-3 bg-[#0c1a33]/60 border border-[#163663] rounded-lg flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#00ffcc] animate-ping" />
                    <span className="text-[11px] font-bold text-[#42a2e4]">Processing verbal synapses, Sir...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick action helper prompt chips */}
            <div className="mt-4 pt-3 border-t border-[#14325c]/45 flex flex-wrap gap-2">
              <button 
                onClick={() => handleSendMessage("Jervis, scan system diagnostics")} 
                className="px-2.5 py-1 rounded bg-[#0b172e] hover:bg-[#122850] border border-[#1b3d6f] text-[#3bc0ff] text-[10px] font-bold uppercase transition-colors"
              >
                Full Scan
              </button>
              <button 
                onClick={() => handleSendMessage("Jervis, engage defense shields")} 
                className="px-2.5 py-1 rounded bg-[#0b172e] hover:bg-[#122850] border border-[#1b3d6f] text-[#3bc0ff] text-[10px] font-bold uppercase transition-colors"
              >
                Shield Override
              </button>
              <button 
                onClick={() => handleSendMessage("Jervis, activate reactor overdrive")} 
                className="px-2.5 py-1 rounded bg-[#0b172e] hover:bg-[#122850] border border-[#1b3d6f] text-[#3bc0ff] text-[10px] font-bold uppercase transition-colors"
              >
                Overdrive surger
              </button>
              <button 
                onClick={() => handleSendMessage("Tell me a Stark Industries trivia")} 
                className="px-2.5 py-1 rounded bg-[#0b172e] hover:bg-[#122850] border border-[#1b3d6f] text-[#3bc0ff] text-[10px] font-bold uppercase transition-colors"
              >
                Ask Stark Trivia
              </button>
            </div>
          </div>

          {/* Bottom Live System logs console */}
          <div className="bg-[#050b16]/95 border border-[#14325c]/50 rounded-xl p-4 flex-1 flex flex-col shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] relative">
            <div className="flex items-center justify-between text-[10px] uppercase font-black text-[#5a7ca8] tracking-widest border-b border-[#14325c]/30 pb-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-[#3bc0ff]" />
                <span>SYS_REALTIME_LOG_STREAM</span>
              </div>
              <span className="text-[9px] font-bold text-emerald-500 animate-pulse">GRID_SECURED</span>
            </div>

            {/* Terminal output box */}
            <div className="flex-1 overflow-y-auto font-mono text-[10px] leading-relaxed space-y-1.5 pr-2 scrollbar-thin scrollbar-thumb-[#112647] max-h-[140px]">
              {logs.map((log, index) => {
                const colorMap = {
                  info: "text-[#4e96ff]",
                  success: "text-[#10b981]",
                  warn: "text-amber-500",
                  error: "text-red-500 font-bold",
                  comm: "text-[#a24bff]",
                };
                return (
                  <div key={index} className="flex items-start gap-2 select-text">
                    <span className="text-[#3b5982] shrink-0 font-bold">[{log.timestamp}]</span>
                    <span className="text-[#1e3e68] shrink-0">&gt;&gt;</span>
                    <span className={colorMap[log.type]}>{log.text}</span>
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>

            {/* Direct Keyboard command terminal input at the very bottom */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="mt-3 flex gap-2 border-t border-[#14325c]/30 pt-3"
            >
              <div className="flex-1 relative flex items-center">
                <span className="absolute left-3 text-[#3bc0ff] font-bold text-xs select-none">&gt;&gt;</span>
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Initiate terminal manual protocol string..."
                  className="w-full bg-[#070e1c] border border-[#1d4c8c] focus:border-[#40c3ff] focus:outline-none rounded-lg py-2.5 pl-8 pr-4 text-xs text-[#e1f0ff] placeholder-[#38557a] transition-all font-mono"
                />
              </div>
              <button 
                type="submit"
                className="bg-[#0e2142] hover:bg-[#18396c] border border-[#215194] text-[#40c3ff] px-4 rounded-lg flex items-center justify-center transition-colors font-bold uppercase text-xs"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Subtle diagnostic grids at absolute bottom */}
      <footer className="border-t border-[#152e52]/40 bg-[#060b16]/70 py-2.5 px-4 text-[9px] uppercase tracking-wider text-[#49658e] text-center z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <span>Stark Cybernetic Interface Protocol J.E.R.V.I.S</span>
          <div className="flex gap-4">
            <span>PING: {latency}ms</span>
            <span>SYSTEM_CPU_TEMP: {(coreTemp).toFixed(1)}°C</span>
            <span>GRID_SEC_HASH: AD3-84F</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
