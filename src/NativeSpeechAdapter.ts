import { SpeechRecognition as CapSpeechRecognition } from "@capacitor-community/speech-recognition";
import { Capacitor } from "@capacitor/core";

export class NativeSpeechAdapter {
  continuous = false;
  interimResults = true;
  lang = "en-US";
  
  onstart: () => void = () => {};
  onresult: (event: any) => void = () => {};
  onerror: (event: any) => void = () => {};
  onend: () => void = () => {};

  private listening = false;
  private isSupported = false;

  constructor() {
    if (Capacitor.isNative) {
      CapSpeechRecognition.available().then(({ available }) => {
        this.isSupported = available;
      }).catch(() => {
        this.isSupported = false;
      });

      CapSpeechRecognition.addListener('partialResults', (data: any) => {
        if (data.matches && data.matches.length > 0) {
          this.onresult({
            results: [[{ transcript: data.matches[0] }]]
          });
        }
      });
      
      CapSpeechRecognition.addListener('listeningState', (data: any) => {
        if (data.status === 'stopped') {
          if (this.listening) {
             this.listening = false;
             this.onend();
          }
        } else if (data.status === 'started') {
           this.listening = true;
        }
      });
    }
  }
  
  async start() {
    if (this.listening) return;
    if (!Capacitor.isNative) return;
    try {
      const { speechRecognition } = await CapSpeechRecognition.requestPermissions();
      if (speechRecognition !== 'granted') {
        this.onerror({ error: 'not-allowed' });
        return;
      }
      this.listening = true;
      this.onstart();
      await CapSpeechRecognition.start({
        language: this.lang,
        partialResults: this.interimResults,
        popup: false,
      });
    } catch (e: any) {
      this.listening = false;
      this.onerror({ error: e.message || 'unknown' });
      this.onend();
    }
  }

  stop() {
    if (!this.listening) return;
    if (!Capacitor.isNative) return;
    this.listening = false;
    CapSpeechRecognition.stop();
    this.onend();
  }

  abort() {
    this.stop();
  }
}

export const nativeSpeechAdapter = new NativeSpeechAdapter();
