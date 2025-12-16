export interface GoveeCapability {
  instance: string;
  parameters: Record<string, unknown>;
  type: string;
}

export interface GoveeDevice {
  device: string;
  model: string;
  deviceName: string;
  controllable: boolean;
  properties: Record<string, unknown>;
  retrievable: boolean;
  supportCmds: string[];
}

export interface GoveeApiResponse {
  code: number;
  data: {
    devices: GoveeDevice[];
  };
  message: string;
}

export interface DeviceGroup {
  lightStrip: GoveeDevice[];
  gamingBars: GoveeDevice[];
  bulbs: GoveeDevice[];
  groups: GoveeDevice[];
  all: GoveeDevice[];
}

export type ColorPresetValue = number | string | { r: number; g: number; b: number };

export interface ColorPreset {
  name: string;
  description: string;
  commands: {
    deviceType?: 'lightStrip' | 'bulbs' | 'all';
    action: 'color' | 'scene' | 'brightness' | 'powerSwitch';
    value: ColorPresetValue;
  }[];
}