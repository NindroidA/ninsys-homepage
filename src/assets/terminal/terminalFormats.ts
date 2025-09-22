/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
export interface CommandHelp {
  title: string;
  description?: string;
  sections: HelpSection[];
  examples?: string[];
  footer?: string;
}

export interface HelpSection {
  title: string;
  commands: HelpCommand[];
}

export interface HelpCommand {
  command: string;
  description: string;
  usage?: string;
}

// helper function to format help menus consistently
export const formatHelp = (help: CommandHelp): string => {
  const { title, description, sections, examples, footer } = help;
  
  let output = `\n${title}\n`;
  output += '='.repeat(title.length) + '\n';
  
  if (description) {
    output += `\n${description}\n`;
  }
  
  sections.forEach(section => {
    output += `\n${section.title}:\n`;
    section.commands.forEach(cmd => {
      const cmdText = cmd.usage || cmd.command;
      output += `  ${cmdText.padEnd(25)} - ${cmd.description}\n`;
    });
  });
  
  if (examples?.length) {
    output += '\nExamples:\n';
    examples.forEach(example => {
      output += `  💡 ${example}\n`;
    });
  }
  
  if (footer) {
    output += `\n${footer}\n`;
  }
  
  return output;
};

// helper function to format help menus consistently (but fancy lol)
export const formatFancyHelp = (help: CommandHelp): string => {
  let output = `\n╭─ ${help.title} ─╮\n`;
  
  if (help.description) {
    output += `│ ${help.description}\n`;
    output += `╰${'─'.repeat(help.title.length + 4)}╯\n`;
  }
  
  help.sections.forEach((section, index) => {
    output += `\n┌ ${section.title}\n`;
    section.commands.forEach((cmd, cmdIndex) => {
      const isLast = cmdIndex === section.commands.length - 1;
      const prefix = isLast ? '└─' : '├─';
      const cmdText = cmd.usage || cmd.command;
      output += `${prefix} ${cmdText.padEnd(20)} │ ${cmd.description}\n`;
    });
  });
  
  return output;
};

// command help configurations
export const helpConfigs: Record<string, CommandHelp> = {
  lights: {
    title: '🔆 LIGHTS CONTROL',
    description: 'Control your Govee smart lights with presets and group control',
    sections: [
      {
        title: 'Quick Presets',
        commands: [
          { command: 'gaming', description: 'Apply gaming mode preset' },
          { command: 'magenta', description: 'Apply magenta vibes preset' },
          { command: 'cozy', description: 'Apply cozy warm preset' },
          { command: 'party', description: 'Apply party mode preset' },
          { command: 'focus', description: 'Apply focus mode preset' }
        ]
      },
      {
        title: 'Group Controls',
        commands: [
          //{ command: 'fan <on|off>', description: 'Control fan lights (H6004 bulbs)' },
          //{ command: 'gaming-bar <on|off>', description: 'Control gaming light bars (H6047)' },
          //{ command: 'strip <on|off>', description: 'Control light strips (H619B)' },
          { command: 'on', description: 'Turn all lights on' },
          { command: 'off', description: 'Turn all lights off' }
        ]
      },
      {
        title: 'Advanced',
        commands: [
          { command: 'preset <name>', description: 'Apply specific preset by name' },
          { command: 'groups', description: 'Show device groups' },
          { command: 'list', description: 'List all devices' },
          { command: 'status', description: 'Show lighting system status' }
        ]
      }
    ],
    examples: [
      'lights preset cozy-warm',
      'lights groups'
    ],
    footer: '💡 Gaming bars maintain default rainbow mode unless explicitly controlled'
  },

  help: {
    title: '🆘 COMMAND HELP',
    description: 'Available terminal commands',
    sections: [
      {
        title: 'Public Commands',
        commands: [] // will be populated dynamically
      },
      {
        title: 'Authenticated Commands',
        commands: [] // will be populated dynamically
      }
    ],
    footer: 'Use "<command> help" for detailed command information'
  }
};

export const formatDeviceGroups = (groups: any) => {
  if (!groups) {
    return '❌ Device groups data is undefined';
  }
  
  return `
🔌 YOUR DEVICE GROUPS:
Light Strip: ${groups.lightStrip?.length || 0} device(s)
Gaming Bars: ${groups.gamingBars?.length || 0} device(s) (stays on default)
Bulbs: ${groups.bulbs?.length || 0} device(s)
Groups: ${groups.groups?.length || 0} device(s)
Total: ${groups.all?.length || 0} controllable device(s)`;
};

export const formatDebugInfo = (apiKey: string) => {
  return `
🔍 DEBUG INFO:
API Key configured: ${apiKey ? 'Yes' : 'No'}
API Key length: ${apiKey?.length || 0}
API Key starts with: ${apiKey?.substring(0, 8)}...`;
};

export const formatRawDevices = (devices: any[]) => {
  return `
🔍 RAW DEVICE DATA:
Total devices: ${devices.length}

${devices.map(d => `Device: ${d.deviceName}
SKU: ${d.sku}
ID: ${d.device}
Capabilities: ${d.capabilities?.length || 0}
`).join('\n')}`;
};

export const formatPresetList = (presets: Record<string, any>) => {
  const presetList = Object.entries(presets)
    .map(([key, preset]) => `${key.padEnd(12)} - ${preset.description}`)
    .join('\n');
  
  return `
🎨 AVAILABLE PRESETS:
${presetList}

Usage: lights preset <name>`;
};

export const formatDeviceList = (devices: any[]) => {
  if (!devices || !Array.isArray(devices)) {
    return '❌ Device list data is undefined or not an array';
  }
  
  const deviceList = devices.map(d => {
    const name = d?.deviceName || 'Unknown Device';
    const model = d?.model || 'Unknown Model';
    const controllable = d?.controllable ? 'Controllable' : 'Read-only';
    return `${name} (${model}) - ${controllable}`;
  }).join('\n');
  
  return `
📱 Your Govee Devices:
${deviceList}`;
};