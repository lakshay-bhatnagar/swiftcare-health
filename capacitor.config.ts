import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swiftcare.health',
  appName: 'SwiftCare',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https' // Forces iOS to use HTTPS for internal routing
  }
};

export default config;