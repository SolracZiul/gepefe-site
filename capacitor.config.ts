import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gepefe.app',
  appName: 'GEPEFE',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
