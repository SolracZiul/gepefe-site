import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gepefe.app',
  appName: 'gepefe-knowledge-vault',
  webDir: 'dist',
  server: {
    url: 'https://cd0ffe65-d228-4695-aa75-5bda0b9594e2.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
};

export default config;
