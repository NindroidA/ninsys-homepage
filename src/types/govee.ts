export interface GoveeCapability {
  instance: string;
  parameters: any;
  type: string;
}

export interface GoveeDevice {
  device: string;
  model: string;
  deviceName: string;
  controllable: boolean;
  properties: any;
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

export interface ColorPreset {
  name: string;
  description: string;
  commands: {
    deviceType?: 'lightStrip' | 'bulbs' | 'all';
    action: 'color' | 'scene' | 'brightness' | 'powerSwitch';
    value: any;
  }[];
}