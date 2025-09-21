import { ColorPreset } from '../types/govee';

export const goveePresets: Record<string, ColorPreset> = {
  magenta: {
    name: 'Magenta Vibes',
    description: 'Purple-pink magenta theme across all lights',
    commands: [
      {
        deviceType: 'all',
        action: 'color',
        value: 16711827 // RGB(255, 20, 147) converted to integer
      },
      {
        deviceType: 'all',
        action: 'brightness',
        value: 80
      }
    ]
  },

  cozy: {
    name: 'Cozy Evening',
    description: 'Warm orange-yellow tones for relaxation',
    commands: [
      {
        deviceType: 'all',
        action: 'color',
        value: 16747561 // RGB(255, 147, 41)
      },
      {
        deviceType: 'all',
        action: 'brightness',
        value: 60
      }
    ]
  },

  gaming: {
    name: 'Gaming Mode',
    description: 'Cool cyan-blue theme perfect for gaming',
    commands: [
      {
        deviceType: 'all',
        action: 'color',
        value: 65535 // RGB(0, 255, 255) - cyan
      },
      {
        deviceType: 'all',
        action: 'brightness',
        value: 90
      }
    ]
  }
};