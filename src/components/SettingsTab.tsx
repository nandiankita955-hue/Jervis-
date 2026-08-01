import React, { useState, useEffect } from "react";
import { 
  Key, 
  Cpu, 
  Lock, 
  EyeOff, 
  Eye, 
  Check, 
  Volume2, 
  ShieldAlert,
  Save,
  Globe,
  Settings,
  Eye as ViewIcon,
  ShieldCheck,
  Power,
  Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsTabProps {
  addLog: (text: string, type: "info" | "success" | "warn" | "error" | "comm") => void;
  playBeep: (freq?: number, type?: OscillatorType, duration?: number, gainValue?: number) => void;
  playConfirm: () => void;
  activeProvider: string;
  setActiveProvider: (prov: string) => void;
  memory: any;
  setMemory: React.Dispatch<React.SetStateAction<any>>;
  pinCode: string;
  setPinCode: (pin: string) => void;
  pinLockActive: boolean;
  setPinLockActive: (act: boolean) => void;
  privacyMode: boolean;
  setPrivacyMode: (act: boolean) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  addLog,
  playBeep,
  playConfirm,
  activeProvider,
  setActiveProvider,
  memory,
  setMemory,
  pinCode,
  setPinCode,
  pinLockActive,
  setPinLockActive,
  privacyMode,
  setPrivacyMode
}) => {
  // Key Storage State
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load API Key on component mount
  useEffect(() => {
    const savedKey = localStorage.getItem("jervis_gemini_api_key") || "";
    setApiKey(savedKey);
  }, []);

  // PIN settings
  const [pinInput, setPinInput] = useState("");
  const [pinSetupMode, setPinSetupMode] = useState(false);

  const handleSaveApiKey = () => {
    playConfirm();
    localStorage.setItem("jervis_gemini_api_key", apiKey.trim());
    setIsSaved(true);
    addLog(`Cognitive Core: Gemini API Key initialized and saved in client storage.`, "success");
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length < 4) {
      addLog("PIN error: Lock sequence must be at least 4 digits.", "error");
      return;
    }
    setPinCode(pinInput);
    setPinLockActive(true);
    setPinSetupMode(false);
    addLog("Biometric App Lock sequence initialized and encrypted.", "success");
    playConfirm();
  };

  const disablePinLock = () => {
    setPinCode("");
    setPinLockActive(false);
    setPinInput("");
    addLog("Suit Security Overrides: App lock disabled.", "warn");
    playBeep(400, "sine", 0.05, 0.02);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 text-xs text-[#adc5ea] max-h-[440px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#153463]"
    >
      
      {/* SECTION 1: GEMINI API KEY CONFIGURATION */}
      <div className="p-3.5 rounded-lg border border-cyan-500/30 bg-[#071329]/80 space-y-2.5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="font-bold text-[#3bc0ff] uppercase tracking-wide text-[10px] flex items-center gap-1.5">
          <Key className="h-4 w-4 text-cyan-400 animate-pulse" />
          Neural Matrix API Key (জেমিনি এপিআই কি)
        </div>
        
        <p className="text-[9px] text-[#5e7ea8] leading-normal uppercase">
          Configure your personal Gemini AI key below. Required to operate JARVIS autonomously when packaged as an APK or deployed service.
        </p>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input 
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Gemini API key (AIzaSy...)"
              className="w-full bg-[#040914] border border-[#1d4c8c] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 rounded px-2.5 py-2 text-[10px] text-white font-mono placeholder-[#34537d] focus:outline-none transition-all"
            />
            <button 
              type="button"
              onClick={() => { setShowKey(!showKey); playBeep(750, "sine", 0.04, 0.02); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5e7ea8] hover:text-cyan-400 transition-colors"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button 
            type="button"
            onClick={handleSaveApiKey}
            className="bg-cyan-500/15 hover:bg-cyan-500/30 border border-cyan-500/55 text-cyan-400 px-3 rounded flex items-center gap-1 font-bold text-[9px] uppercase transition-all whitespace-nowrap"
          >
            {isSaved ? <Check className="h-3 w-3 text-emerald-400" /> : <Save className="h-3 w-3" />}
            {isSaved ? "Saved" : "Save Matrix"}
          </button>
        </div>

        <div className="p-2 bg-cyan-500/5 rounded border border-cyan-500/20 text-[9px] leading-relaxed text-[#5e7ea8]">
          <span className="text-cyan-400 font-bold">INFO: </span>
          আপনার জেমিনি এপিআই কি ব্রাউজারের মেমরিতে নিরাপদে সংরক্ষিত থাকবে এবং সরাসরি এপিআই প্রক্সি গেটওয়ের মাধ্যমে কাজ করবে।
        </div>
      </div>

      {/* SECTION 2: COGNITIVE BRAIN SELECTOR */}
      <div className="p-3.5 rounded-lg border border-[#1d4c8c]/50 bg-[#071329]/80 space-y-2.5">
        <div className="font-bold text-[#3bc0ff] uppercase tracking-wide text-[10px] flex items-center gap-1.5">
          <Cpu className="h-4 w-4 text-amber-400" />
          Active Cognitive Brain Selector (কগনিটিভ ব্রেন)
        </div>
        <div className="grid grid-cols-3 gap-2 text-[9px] font-bold uppercase">
          {["Gemini-3.5-Flash", "DeepSeek-R1", "Claude-3.5"].map(prov => (
            <button
              key={prov}
              onClick={() => {
                setActiveProvider(prov);
                addLog(`Cognitive Core redirected to: ${prov}`, "success");
                playConfirm();
              }}
              className={`p-2 rounded border transition-all flex flex-col items-center gap-1 justify-center ${activeProvider === prov ? "bg-[#112347] border-[#3bc0ff] text-[#3bc0ff] shadow-[0_0_10px_rgba(59,192,255,0.15)]" : "bg-[#0b172e] border-[#1d4c8c] text-[#5e7ea8] hover:border-[#1d4c8c]/80"}`}
            >
              <Sliders className="h-3 w-3 opacity-70" />
              <span>{prov}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 3: VOICE INPUT & LANGUAGE */}
      <div className="p-3.5 rounded-lg border border-[#1d4c8c]/50 bg-[#071329]/80 space-y-3">
        <div className="font-bold text-[#3bc0ff] uppercase tracking-wide text-[10px] flex items-center gap-1.5">
          <Volume2 className="h-4 w-4 text-emerald-400" />
          Vocal Core Interpretation (ভাষা ও ওয়েক ওয়ার্ড)
        </div>

        {/* Wake Word Input */}
        <div className="space-y-1">
          <div className="text-[9px] uppercase font-bold text-[#5e7ea8]">Active Wake Word (কাস্টম ওয়েক ওয়ার্ড)</div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={memory.userPrefs.wakeWord}
              onChange={(e) => setMemory((prev: any) => ({ ...prev, userPrefs: { ...prev.userPrefs, wakeWord: e.target.value } }))}
              className="bg-[#040914] border border-[#1d4c8c] focus:outline-none rounded px-2.5 py-1.5 text-[10px] text-white font-bold flex-1"
              placeholder="e.g. Jervis, Jarvis, Friday..."
            />
            <button 
              onClick={() => { addLog(`Wake word locked: "${memory.userPrefs.wakeWord}"`, "success"); playConfirm(); }} 
              className="bg-[#112347] border border-[#215194] text-[#3bc0ff] px-3.5 rounded text-[8px] font-black uppercase hover:bg-[#1c3a70] transition-colors"
            >
              Lock
            </button>
          </div>
        </div>

        {/* Language Selection */}
        <div className="flex justify-between items-center pt-1.5 border-t border-[#14325c]/35">
          <div>
            <div className="font-bold text-[#00ffcc] text-[9.5px] uppercase tracking-wider mb-0.5">
              Continuous Listening
            </div>
            <p className="text-[8px] text-[#5e7ea8]">Voice command always active</p>
          </div>
          <button 
            onClick={() => {
              const cl = !memory.userPrefs.continuousListening;
              setMemory((prev: any) => ({ ...prev, userPrefs: { ...prev.userPrefs, continuousListening: cl } }));
              addLog(`Continuous listening: ${cl ? "ENGAGED" : "SHUTDOWN"}`, cl ? "success" : "warn");
              playConfirm();
            }}
            className={`px-3 py-1 text-[8px] font-black uppercase rounded border transition-all ${memory.userPrefs.continuousListening ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" : "bg-[#0b172e] border-[#1d4c8c] text-[#5e7ea8]"}`}
          >
            {memory.userPrefs.continuousListening ? "ACTIVE (ON)" : "OFFLINE (OFF)"}
          </button>
        </div>

        <div className="flex justify-between items-center pt-2.5 border-t border-[#14325c]/35">
          <div>
            <div className="font-bold text-[#00ffcc] text-[9.5px] uppercase tracking-wider mb-0.5">
              Interpretation Lang
            </div>
            <p className="text-[8px] text-[#5e7ea8]">Set verbal parser language</p>
          </div>
          <div className="flex gap-1.5">
            <button 
              onClick={() => {
                setMemory((prev: any) => ({ ...prev, userPrefs: { ...prev.userPrefs, speechLang: "en-US" } }));
                addLog("Vocal processing language set to English (en-US).", "info");
                playConfirm();
              }}
              className={`px-2.5 py-1 text-[8px] font-black uppercase rounded border transition-all ${(memory.userPrefs.speechLang || "en-US") === "en-US" ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-400" : "bg-[#0b172e] border-[#1d4c8c] text-[#5e7ea8]"}`}
            >
              English
            </button>
            <button 
              onClick={() => {
                setMemory((prev: any) => ({ ...prev, userPrefs: { ...prev.userPrefs, speechLang: "bn-BD" } }));
                addLog("Vocal processing language set to Bengali (bn-BD).", "info");
                playConfirm();
              }}
              className={`px-2.5 py-1 text-[8px] font-black uppercase rounded border transition-all ${(memory.userPrefs.speechLang || "en-US") === "bn-BD" ? "bg-orange-500/15 border-orange-500/40 text-orange-400" : "bg-[#0b172e] border-[#1d4c8c] text-[#5e7ea8]"}`}
            >
              বাংলা
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: SECURITY PIN LOCK & PRIVACY MODE */}
      <div className="p-3.5 rounded-lg border border-[#1d4c8c]/50 bg-[#071329]/80 space-y-3">
        <div className="font-bold text-[#3bc0ff] uppercase tracking-wide text-[10px] flex items-center gap-1.5">
          <Lock className="h-4 w-4 text-[#ff5c5c]" />
          App Access Security (নিরাপত্তা ও লক)
        </div>

        {pinLockActive ? (
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex justify-between items-center font-bold">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="h-4 w-4" /> SECURE APP PIN ENCRYPTED
            </div>
            <button 
              onClick={disablePinLock}
              className="px-2 py-1 bg-red-500/10 hover:bg-red-500/25 border border-red-500/40 text-red-400 rounded text-[8px] font-black uppercase transition-all"
            >
              Disable
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {!pinSetupMode ? (
              <button
                onClick={() => { setPinSetupMode(true); playBeep(700, "sine", 0.05, 0.02); }}
                className="w-full bg-[#112347] border border-[#215194] text-[#3bc0ff] py-1.5 rounded uppercase font-black tracking-wider text-[9px] hover:bg-[#183261] transition-all"
              >
                ENABLE SECURITY PIN LOCK
              </button>
            ) : (
              <form onSubmit={handleSetPin} className="flex gap-2 bg-[#040914] p-1.5 rounded border border-[#1d4c8c]/50">
                <input 
                  type="password" 
                  placeholder="Set 4-6 digit PIN..."
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                  className="bg-black border border-[#1d4c8c] focus:outline-none rounded px-2 py-1 text-[10px] text-white font-mono flex-1 text-center font-black tracking-widest"
                />
                <button 
                  type="submit"
                  className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 px-3 rounded text-[8px] font-black uppercase"
                >
                  Save PIN
                </button>
                <button 
                  type="button" 
                  onClick={() => setPinSetupMode(false)}
                  className="text-red-400 text-[8px] font-black uppercase p-1"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-2.5 border-t border-[#14325c]/35">
          <div>
            <div className="font-bold text-[#00ffcc] text-[9.5px] uppercase tracking-wider mb-0.5">
              Privacy Shield
            </div>
            <p className="text-[8px] text-[#5e7ea8]">Do not record chat logs into terminal</p>
          </div>
          <button 
            onClick={() => {
              setPrivacyMode(!privacyMode);
              addLog(`Privacy constraints: ${!privacyMode ? "ENGAGED [COGNITIVE STREAM RESTRICTED]" : "DISENGAGED [TIMELINE LOGGING ACTIVE]"}`, "info");
              playBeep(800, "sine", 0.05, 0.02);
            }}
            className={`px-3 py-1 text-[8px] border font-black uppercase rounded transition-all ${privacyMode ? "bg-amber-500/15 border-amber-500/40 text-amber-400" : "bg-slate-500/15 border-slate-500/30 text-slate-400"}`}
          >
            {privacyMode ? "ON" : "OFF"}
          </button>
        </div>
      </div>

    </motion.div>
  );
};
