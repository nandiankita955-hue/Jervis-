import React, { useState, useEffect, useRef } from "react";
import { 
  Zap, 
  Smartphone, 
  Battery, 
  HardDrive, 
  Volume2, 
  Sun, 
  RotateCw, 
  Wifi, 
  Bluetooth, 
  Phone, 
  Globe, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  MapPin, 
  Mail, 
  Camera, 
  AlertTriangle,
  Send,
  Sparkles,
  Search,
  Video
} from "lucide-react";
import { motion } from "motion/react";

interface HardwareTabProps {
  flashlightOn: boolean;
  toggleFlashlight: (forceState?: boolean) => Promise<boolean>;
  addLog: (text: string, type: "info" | "success" | "warn" | "error" | "comm") => void;
  playBeep: (freq?: number, type?: OscillatorType, duration?: number, gainValue?: number) => void;
  playConfirm: () => void;
  waNumber: string;
  setWaNumber: (num: string) => void;
  waMessage: string;
  setWaMessage: (msg: string) => void;
  openWhatsApp: (num?: string, msg?: string) => void;
}

export const HardwareTab: React.FC<HardwareTabProps> = ({
  flashlightOn,
  toggleFlashlight,
  addLog,
  playBeep,
  playConfirm,
  waNumber,
  setWaNumber,
  waMessage,
  setWaMessage,
  openWhatsApp
}) => {
  // Battery stats
  const [batteryLevel, setBatteryLevel] = useState<number>(85);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  
  // Storage stats
  const [usedStorage, setUsedStorage] = useState<string>("24.5 GB");
  const [freeStorage, setFreeStorage] = useState<string>("103.5 GB");
  const [storagePercent, setStoragePercent] = useState<number>(19);

  // Location stats
  const [latitude, setLatitude] = useState<string>("Searching...");
  const [longitude, setLongitude] = useState<string>("Searching...");
  const [locating, setLocating] = useState<boolean>(false);

  // Media controls
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<string>("Stark Industries - Main Theme.mp3");
  const [trackProgress, setTrackProgress] = useState<number>(35);

  // Phone action inputs
  const [callNumber, setCallNumber] = useState<string>("919876543210");
  const [searchQuery, setSearchQuery] = useState<string>("Stark Tower New York");
  const [emailTo, setEmailTo] = useState<string>("pepper@starkindustries.com");
  const [emailSubject, setEmailSubject] = useState<string>("Laboratory Clearance Needed");

  // Camera settings
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Load Real Battery & Storage Info if supported
  useEffect(() => {
    // Real battery integration
    if ("getBattery" in navigator) {
      (navigator as any).getBattery().then((bat: any) => {
        setBatteryLevel(Math.round(bat.level * 100));
        setIsCharging(bat.charging);
        
        bat.addEventListener("levelchange", () => {
          setBatteryLevel(Math.round(bat.level * 100));
        });
        bat.addEventListener("chargingchange", () => {
          setIsCharging(bat.charging);
          addLog(`Power supply system: ${bat.charging ? "AC CURRENT ENGAGED (CHARGING)" : "STANDALONE BATTERY POWER"}`, "info");
        });
      });
    }

    // Real Storage Integration
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        const used = estimate.usage || 0;
        const total = estimate.quota || 0;
        if (total > 0) {
          const usedGB = (used / (1024 * 1024 * 1024)).toFixed(2);
          const totalGB = (total / (1024 * 1024 * 1024)).toFixed(1);
          const percent = Math.round((used / total) * 100);
          setUsedStorage(`${usedGB} GB`);
          setFreeStorage(`${(parseFloat(totalGB) - parseFloat(usedGB)).toFixed(2)} GB`);
          setStoragePercent(percent);
        }
      });
    }
  }, []);

  // Sync track timeline simulation
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setTrackProgress(prev => (prev >= 100 ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Request real geolocation
  const requestLocation = () => {
    setLocating(true);
    addLog("Querying global GPS coordinate relays...", "info");
    playBeep(900, "sine", 0.05, 0.02);
    
    if (!navigator.geolocation) {
      addLog("Geolocation receiver unaligned on this platform.", "error");
      setLatitude("Unavailable");
      setLongitude("Unavailable");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setLocating(false);
        addLog(`GPS stream established: Lat ${pos.coords.latitude.toFixed(4)}, Lng ${pos.coords.longitude.toFixed(4)}`, "success");
        playConfirm();
      },
      (err) => {
        addLog(`GPS satellite lock failed: ${err.message}`, "warn");
        setLatitude("40.7128° N");
        setLongitude("74.0060° W"); // Fallback to NYC Stark Tower
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Launch Live Camera Feed
  const toggleCamera = async () => {
    if (cameraActive) {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      setCameraStream(null);
      setCameraActive(false);
      addLog("Live Camera Feed disconnected.", "warn");
      playBeep(400, "sine", 0.05, 0.02);
    } else {
      addLog("Requesting hardware optical connection...", "info");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });
        setCameraStream(stream);
        setCameraActive(true);
        addLog("Optical link established [CAMERA ACTIVE]", "success");
        playConfirm();
        
        // Wait a tick for ref and load
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 100);
      } catch (err: any) {
        addLog(`Camera interface rejected: ${err.message}`, "error");
        playBeep(200, "sawtooth", 0.2, 0.05);
      }
    }
  };

  // Capture a snapshot from camera feed
  const captureSnapshot = () => {
    if (!videoRef.current || !cameraStream) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/png");
        setCapturedPhoto(dataUrl);
        addLog("High-resolution optical capture saved to local matrix.", "success");
        playConfirm();
      }
    } catch (e: any) {
      addLog(`Snapshot capture failed: ${e.message}`, "error");
    }
  };

  const triggerCall = () => {
    if (!callNumber.trim()) return;
    addLog(`Directing terminal caller protocol to: ${callNumber}`, "info");
    playConfirm();
    window.open(`tel:${callNumber.replace(/\D/g, "")}`, "_self");
  };

  const composeEmail = () => {
    if (!emailTo.trim()) return;
    addLog(`Composing secure mail transmission to ${emailTo}`, "info");
    playConfirm();
    window.open(`mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=Sir requires priority feedback.`, "_blank");
  };

  const openNavigation = () => {
    const q = encodeURIComponent(searchQuery);
    addLog(`Opening satellite maps interface for: ${searchQuery}`, "info");
    playConfirm();
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  };

  return (
    <div className="space-y-4 text-xs text-[#adc5ea] max-h-[480px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#153463]">
      
      {/* Device Core Hardware Stats Panel */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#071329]/90 border border-[#1d4c8c]/50 rounded-lg p-2 flex flex-col justify-between">
          <div className="flex items-center gap-1 font-bold text-[#5e7ea8] text-[9px] uppercase">
            <Battery className={`h-3.5 w-3.5 ${isCharging ? "text-emerald-400 animate-pulse" : "text-[#3bc0ff]"}`} />
            Power Relay
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-sm font-bold text-white">{batteryLevel}%</span>
            <span className="text-[8px] text-[#5e7ea8]">{isCharging ? "Charging" : "Battery"}</span>
          </div>
          <div className="h-1 bg-[#050b16] rounded-full overflow-hidden mt-1">
            <div className={`h-full ${isCharging ? "bg-emerald-400" : "bg-[#3bc0ff]"}`} style={{ width: `${batteryLevel}%` }} />
          </div>
        </div>

        <div className="bg-[#071329]/90 border border-[#1d4c8c]/50 rounded-lg p-2 flex flex-col justify-between">
          <div className="flex items-center gap-1 font-bold text-[#5e7ea8] text-[9px] uppercase">
            <HardDrive className="h-3.5 w-3.5 text-[#00ffcc]" />
            Core Storage
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-sm font-bold text-white">{storagePercent}%</span>
            <span className="text-[8px] text-[#5e7ea8]">{usedStorage} / {parseFloat(usedStorage) + parseFloat(freeStorage) ? (parseFloat(usedStorage) + parseFloat(freeStorage)).toFixed(0) + "G" : "128G"}</span>
          </div>
          <div className="h-1 bg-[#050b16] rounded-full overflow-hidden mt-1">
            <div className="h-full bg-[#00ffcc]" style={{ width: `${storagePercent}%` }} />
          </div>
        </div>

        <div className="bg-[#071329]/90 border border-[#1d4c8c]/50 rounded-lg p-2 flex flex-col justify-between cursor-pointer hover:border-[#3bc0ff]/60 transition-colors" onClick={requestLocation}>
          <div className="flex items-center gap-1 font-bold text-[#5e7ea8] text-[9px] uppercase">
            <MapPin className={`h-3.5 w-3.5 ${locating ? "text-orange-500 animate-spin" : "text-orange-400"}`} />
            GPS Grid
          </div>
          <div className="mt-1 text-[9px] font-mono leading-tight text-white truncate">
            {latitude !== "Searching..." ? `${latitude}, ${longitude}` : "Sync Coordinates"}
          </div>
          <div className="text-[8px] text-orange-400 font-bold uppercase tracking-wider text-right">
            {locating ? "Pinging..." : "Refresh GPS"}
          </div>
        </div>
      </div>

      {/* Core Hardware Controllers */}
      <div className="p-3 rounded-lg border border-[#1d4c8c]/50 bg-[#071329]/80 space-y-3">
        <div className="font-bold text-[#3bc0ff] uppercase tracking-wide text-[10px] flex items-center gap-1">
          <Smartphone className="h-3.5 w-3.5" />
          Hardware Control
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => toggleFlashlight()}
            className={`p-2 rounded border flex items-center justify-center gap-2 transition-all ${flashlightOn ? "bg-amber-500/15 text-amber-400 border-amber-500/40" : "bg-[#0b172e] text-[#5e7ea8] border-[#1d4c8c]"}`}
          >
            <Zap className="h-4 w-4" /> {flashlightOn ? "Torch On" : "Torch Off"}
          </button>
        </div>
      </div>

      {/* Camera Module */}
      <div className="p-3 rounded-lg border border-[#1d4c8c]/50 bg-[#071329]/80 space-y-2">
        <div className="flex justify-between items-center">
          <div className="font-bold text-[#3bc0ff] uppercase tracking-wide text-[10px] flex items-center gap-1">
            <Camera className="h-3.5 w-3.5" />
            STARK Optical Visualizer (ক্যামেরা)
          </div>
          <button 
            onClick={toggleCamera}
            className={`px-2 py-0.5 rounded text-[8px] border uppercase font-bold transition-colors ${cameraActive ? "bg-red-500/15 border-red-500/40 text-red-400" : "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"}`}
          >
            {cameraActive ? "OFFLINE CAMERA" : "CONNECT FEED"}
          </button>
        </div>

        {cameraActive ? (
          <div className="relative rounded-lg overflow-hidden border border-[#1d4c8c] bg-black aspect-video max-h-[160px] flex items-center justify-center">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            {/* Holographic overlays */}
            <div className="absolute inset-0 pointer-events-none border border-[#3bc0ff]/20 flex flex-col justify-between p-2">
              <div className="flex justify-between text-[8px] text-emerald-400 font-mono bg-black/40 px-1 rounded">
                <span>ZOOM: 1.0X</span>
                <span>REC LIVE</span>
              </div>
              <div className="flex justify-center text-[#3bc0ff]">
                <div className="w-6 h-6 border border-dashed border-[#3bc0ff] rounded-full animate-ping" />
              </div>
              <div className="text-[8px] text-right text-white font-mono bg-black/40 px-1 rounded">
                1080P // 60 FPS
              </div>
            </div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-black/55 p-1 rounded-full border border-white/10">
              <button 
                onClick={captureSnapshot}
                className="px-2.5 py-1 rounded-full bg-white text-black font-extrabold text-[8px] uppercase hover:bg-zinc-200"
              >
                Snapshot
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-[#1d4c8c]/60 rounded-lg p-3 text-center text-[#5e7ea8] bg-[#040914] text-[9px]">
            Optical feed scanner standing in standby mode. Connect to begin visual diagnostics.
          </div>
        )}

        {capturedPhoto && (
          <div className="mt-2 p-1.5 border border-[#1d4c8c] bg-[#050b16] rounded-md flex items-center gap-3">
            <img src={capturedPhoto} alt="Captured Snapshot" className="w-14 h-10 object-cover rounded border border-[#1d4c8c]" referrerPolicy="no-referrer" />
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-bold text-white truncate">optical_capture_seq.png</div>
              <div className="text-[7px] text-[#5e7ea8]">ANALYSIS: Neural scan ready for OCR / Image Description</div>
            </div>
            <button 
              onClick={() => setCapturedPhoto(null)} 
              className="p-1 text-red-400 hover:text-red-300 text-[8px] font-bold"
            >
              CLEAR
            </button>
          </div>
        )}
      </div>

      {/* Communications & Settings Shortcuts */}
      <div className="p-3 rounded-lg border border-[#1d4c8c]/50 bg-[#071329]/80 space-y-2.5">
        <div className="font-bold text-[#3bc0ff] uppercase tracking-wide text-[10px] flex items-center gap-1">
          <Send className="h-3.5 w-3.5 text-emerald-400" />
          Communications & Navigation Deck
        </div>

        <div className="space-y-2">
          {/* Dialer Call */}
          <div className="flex gap-1.5">
            <div className="flex-1 relative flex items-center">
              <Phone className="absolute left-2 h-3.5 w-3.5 text-[#5e7ea8]" />
              <input 
                type="text"
                placeholder="Enter Dialer number..."
                value={callNumber}
                onChange={(e) => setCallNumber(e.target.value)}
                className="w-full bg-[#040914] border border-[#1d4c8c] focus:border-[#3bc0ff] focus:outline-none rounded px-2 py-1 pl-7 text-[10px] text-white font-mono"
              />
            </div>
            <button 
              onClick={triggerCall}
              className="bg-[#0e2142] hover:bg-[#153161] border border-[#215194] text-[#3bc0ff] px-2.5 rounded font-bold text-[9px] uppercase transition-colors"
            >
              Dialer
            </button>
          </div>

          {/* Email dispatch */}
          <div className="grid grid-cols-2 gap-1.5">
            <input 
              type="text"
              placeholder="Mail to..."
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              className="bg-[#040914] border border-[#1d4c8c] focus:border-[#3bc0ff] focus:outline-none rounded px-2 py-1 text-[10px] text-white"
            />
            <div className="flex gap-1">
              <input 
                type="text"
                placeholder="Subject..."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="flex-1 bg-[#040914] border border-[#1d4c8c] focus:border-[#3bc0ff] focus:outline-none rounded px-2 py-1 text-[10px] text-white"
              />
              <button 
                onClick={composeEmail}
                className="bg-[#0e2142] hover:bg-[#153161] border border-[#215194] text-[#3bc0ff] px-2 rounded font-bold text-[9px] uppercase transition-colors"
              >
                Mail
              </button>
            </div>
          </div>

          {/* Maps Nav */}
          <div className="flex gap-1.5">
            <div className="flex-1 relative flex items-center">
              <MapPin className="absolute left-2 h-3.5 w-3.5 text-[#5e7ea8]" />
              <input 
                type="text"
                placeholder="Search Places / Start Navigation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#040914] border border-[#1d4c8c] focus:border-[#3bc0ff] focus:outline-none rounded px-2 py-1 pl-7 text-[10px] text-white"
              />
            </div>
            <button 
              onClick={openNavigation}
              className="bg-[#0e2142] hover:bg-[#153161] border border-[#215194] text-[#3bc0ff] px-2.5 rounded font-bold text-[9px] uppercase transition-colors"
            >
              Navigate
            </button>
          </div>

          {/* WhatsApp Direct link */}
          <div className="border-t border-[#1d4c8c]/30 pt-2.5 space-y-1.5">
            <div className="text-[8px] font-bold text-[#5e7ea8] uppercase">Secure WhatsApp Gateway (হোয়াটসঅ্যাপ)</div>
            <div className="grid grid-cols-2 gap-1.5">
              <input 
                type="text"
                placeholder="WhatsApp Number..."
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                className="bg-[#040914] border border-[#1d4c8c] focus:border-[#3bc0ff] focus:outline-none rounded px-2 py-1 text-[10px] text-white font-mono"
              />
              <input 
                type="text"
                placeholder="Draft body..."
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
                className="bg-[#040914] border border-[#1d4c8c] focus:border-[#3bc0ff] focus:outline-none rounded px-2 py-1 text-[10px] text-white"
              />
            </div>
            <button 
              onClick={() => openWhatsApp()}
              className="w-full bg-[#0c2e1f] border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25 rounded py-1 text-[8px] font-bold uppercase transition-all"
            >
              Launch Direct WhatsApp Protocol
            </button>
          </div>
        </div>
      </div>

      {/* Media Player Deck */}
      <div className="p-3 rounded-lg border border-[#1d4c8c]/50 bg-[#071329]/80 space-y-2">
        <div className="font-bold text-[#3bc0ff] uppercase tracking-wide text-[10px] flex items-center gap-1">
          <Play className="h-3.5 w-3.5" />
          Stark Media Communication Hub (মিডিয়া প্লেয়ার)
        </div>

        <div className="p-2 bg-[#040914] rounded border border-[#1d4c8c]/60 flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <div className="text-[10px] font-bold text-white truncate">{currentTrack}</div>
            <div className="text-[8px] text-[#5e7ea8] mt-0.5">AUDIO SYNAPSE DECK</div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                playBeep(400, "sine", 0.05, 0.02);
                setCurrentTrack("Iron Man - Shoot To Thrill AC_DC.mp3");
                addLog("Skipping backwards in Stark archives", "info");
              }}
              className="text-[#5e7ea8] hover:text-white"
            >
              <SkipBack className="h-4 w-4" />
            </button>
            <button 
              onClick={() => {
                setIsPlaying(!isPlaying);
                playBeep(isPlaying ? 500 : 700, "sine", 0.06, 0.03);
                addLog(`Media player: ${!isPlaying ? "PLAYING" : "PAUSED"}`, "info");
              }}
              className="bg-[#0e2142] border border-[#215194] text-[#40c3ff] p-1.5 rounded-full hover:bg-[#18396c]"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <button 
              onClick={() => {
                playBeep(900, "sine", 0.05, 0.02);
                setCurrentTrack("Black Sabbath - Iron Man [HQ].mp3");
                addLog("Skipping forward in Stark archives", "info");
              }}
              className="text-[#5e7ea8] hover:text-white"
            >
              <SkipForward className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="h-1 w-full bg-[#050b16] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#3bc0ff] to-[#00ffcc]" style={{ width: `${trackProgress}%` }} />
          </div>
          <div className="flex justify-between text-[7px] text-[#5e7ea8] font-mono">
            <span>{Math.floor((trackProgress * 210) / 100 / 60)}:{(Math.floor((trackProgress * 210) / 100) % 60).toString().padStart(2, '0')}</span>
            <span>3:30</span>
          </div>
        </div>
      </div>
    </div>
  );
};
