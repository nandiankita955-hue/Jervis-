import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aistudio.app',
  appName: 'AI Studio Mobile',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
