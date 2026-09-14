import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fieldcompanion.app',
  appName: 'Field Companion',
  webDir: 'out',
  server: {
    url: 'http://192.168.40.26:3000',
    cleartext: true,
  },
  ios: {
    scheme: 'fieldcompanion',
  },
  plugins: {
    Camera: {
      permissions: ['camera', 'photos'],
    },
    Network: {},
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#488AFF',
      sound: 'beep.wav',
    },
    Preferences: {},
    CallMonitor: {},
  },
};

export default config;