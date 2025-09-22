/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
import GoveeAPI, { API_BASE } from '../../utils/goveeAPI';
import term from './terminal.json';
import { CommandHelp, formatDeviceGroups, formatDeviceList, formatHelp, formatPresetList, helpConfigs } from './terminalFormats';

export interface TerminalState {
  isAuthenticated: boolean;
  currentUser: string;
  history: string[];
}

export interface CommandSetters {
  setLines?: (callback: (prev: any[]) => any[]) => void;
  setIsAuthenticated?: (auth: boolean) => void;
  setCurrentUser?: (user: string) => void;
}

export interface Command {
  name: string;
  description: string;
  requiresAuth: boolean;
  execute: (args: string[], terminal: TerminalState, setters?: CommandSetters) => string | Promise<string> | void;
}

// terminal responses and messages
export const TERMINAL_MESSAGES = {
  WELCOME: [
    `NINDROID SYSTEMS TERMINAL v${term.version}`,
    'Initializing interface ...',
    'Connection established.',
    '',
    'Welcome to Nindroid Systems! Type "help" for available commands.',
    ''
  ],
  AUTH_SUCCESS: 'Authentication successful! Welcome back, Andrew.',
  AUTH_FAILED: 'Authentication failed. Usage: login <password>',
  AUTH_ALREADY: 'Already authenticated!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  ACCESS_DENIED: (cmd: string) => `Access denied: '${cmd}' requires authentication. Use 'login' first.`,
  COMMAND_NOT_FOUND: (cmd: string) => `Command not found: ${cmd}. Type 'help' for available commands.`,
  COMMAND_ERROR: (error: any) => `Error executing command: ${error}`,
} as const;

export const EASTER_EGGS: string[] = [
  'You found me! Here\'s a cookie 🍪',
  '⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA - Konami Code activated!',
  'sudo make me a sandwich 🥪',
  'There are 10 types of people: those who understand binary and those who don\'t',
  'Why do programmers prefer dark mode? Because light attracts bugs! 🐛',
  'Error 404: Joke not found... wait, that was the joke',
  '/* TODO: Fix this later */ - Every developer ever',
  'It\'s not a bug, it\'s a feature! ✨',
  'Roses are red, violets are blue, unexpected \'{\' on line 32',
  'I\'m not procrastinating, I\'m doing side quests!'
];

// command implementations
export const commands: Record<string, Command> = {
  help: {
    name: 'help',
    description: 'Display available commands',
    requiresAuth: false,
    execute: (args: string[], { isAuthenticated }: TerminalState): string => {
      const publicCommands = Object.values(commands).filter(cmd => !cmd.requiresAuth);
      const privateCommands = Object.values(commands).filter(cmd => cmd.requiresAuth);
      
      const helpConfig: CommandHelp = {
        title: '🆘 COMMAND HELP',
        description: 'Available terminal commands',
        sections: [
          {
            title: 'Public Commands',
            commands: publicCommands.map(cmd => ({
              command: cmd.name,
              description: cmd.description
            }))
          },
          {
            title: isAuthenticated ? 'Authenticated Commands' : 'Authentication Required',
            commands: isAuthenticated 
              ? privateCommands.map(cmd => ({
                  command: cmd.name,
                  description: cmd.description
                }))
              : [{ command: 'login', description: 'Authenticate to access privileged commands' }]
          }
        ],
        examples: ['help', 'lights help', 'status'],
        footer: 'Use "<command> help" for detailed command information'
      };
      
      return formatHelp(helpConfig);
    }
  },

  about: {
    name: 'about',
    description: 'Learn about Nindroid Systems',
    requiresAuth: false,
    execute: (): string => {
      return `
NINDROID SYSTEMS
================
Personal development platform by Andrew Curtis
Built with React TypeScript
Domain: nindroidsystems.com
      `;
    }
  },

  // placeholder status
  status: {
    name: 'status',
    description: 'Check system status',
    requiresAuth: false,
    execute: async (): Promise<string> => {
      return `
SYSTEM STATUS
=============
Status: ONLINE
Uptime: 42 days, 13 hours
Services: 3/3 running
Temperature: 67°C
Memory: 1.2GB / 4.0GB
Storage: 89% available
      `;
    }
  },

  whoami: {
    name: 'whoami',
    description: 'Display current user',
    requiresAuth: false,
    execute: (args: string[], { currentUser, isAuthenticated }: TerminalState): string => {
      return `Current user: ${currentUser}${isAuthenticated ? ' (authenticated)' : ' (guest)'}`;
    }
  },

  clear: {
    name: 'clear',
    description: 'Clear terminal screen',
    requiresAuth: false,
    execute: (args: string[], state: TerminalState, setters?: CommandSetters): string => {
      setters?.setLines?.(() => []);
      return '';
    }
  },

  reload: {
    name: 'reload',
    description: 'Reloads the terminal screen',
    requiresAuth: false,
    execute: (args: string[], state: TerminalState, setters?: CommandSetters): string => {
        // reset terminal lines to initial welcome state
        setters?.setLines?.(() => 
        TERMINAL_MESSAGES.WELCOME.map(content => ({
            type: content === '' ? 'output' : content.includes('TERMINAL') || content.includes('Initializing') || content.includes('Connection') ? 'system' : 'output',
            content
        }))
        );
        
        // reset authentication state
        setters?.setIsAuthenticated?.(false);
        setters?.setCurrentUser?.('guest');
        
        return ''; // return empty string since we're resetting everything
    }
  },

  login: {
    name: 'login',
    description: 'Authenticate with API key',
    requiresAuth: false,
    execute: async (args: string[], state: TerminalState, setters?: CommandSetters): Promise<string> => {
      if (state.isAuthenticated) {
        return TERMINAL_MESSAGES.AUTH_ALREADY;
      }
      
      const apiKey = args[0];
      if (!apiKey) {
        return 'Usage: login <api-key>';
      }
      
      try {
        // test the key by making a request to a protected endpoint
        const response = await fetch(`${API_BASE}/api/govee/devices`, {
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': apiKey
          }
        });
        
        if (response.ok) {
          // store API key in sessionStorage (clears when browser closes)
          sessionStorage.setItem('ninsys_api_key', apiKey);
          setters?.setIsAuthenticated?.(true);
          setters?.setCurrentUser?.('admin');
          return TERMINAL_MESSAGES.AUTH_SUCCESS;
        } else {
          return 'Invalid API key. Access denied.';
        }
      } catch (error) {
        return 'Authentication error. Please check your connection.';
      }
    }
  },

  logout: {
    name: 'logout',
    description: 'Clear authentication and end session',
    requiresAuth: false,
    execute: (args: string[], state: TerminalState, setters?: CommandSetters): string => {
      sessionStorage.removeItem('ninsys_api_key');
      setters?.setIsAuthenticated?.(false);
      setters?.setCurrentUser?.('guest');
      return TERMINAL_MESSAGES.LOGOUT_SUCCESS;
    }
  },

  lights: {
    name: 'lights',
    description: 'Control room lights (on/off/presets/etc)',
    requiresAuth: true,
    execute: async (args: string[]): Promise<string> => {
      const action = args[0]?.toLowerCase();
      
      if (action === 'help' || !action) {
        return formatHelp(helpConfigs.lights!);
      }

      const govee = new GoveeAPI();

      try {
        switch (action) {
          case 'preset':
            const presetName = args[1]?.toLowerCase();
            if (!presetName) {
              return formatPresetList({
                'gaming': { description: 'Cool cyan-blue theme for gaming' },
                'magenta': { description: 'Purple-pink magenta theme' },
                'cozy': { description: 'Warm orange tones for relaxation' },
                'party': { description: 'Vibrant party lighting' },
                'focus': { description: 'Clean white light for productivity' }
              });
            }

            await govee.applyPreset(presetName);
            return `🎨 Applied "${presetName}" preset successfully!`;

          case 'groups':
            const groups = await govee.getDeviceGroups();
            return formatDeviceGroups(groups);

          // Quick preset commands
          case 'gaming':
            await govee.applyPreset('gaming');
            return '🎮 Gaming mode activated!';

          case 'magenta':
            await govee.applyPreset('magenta');
            return '💜 Magenta vibes activated!';

          case 'cozy':
            await govee.applyPreset('cozy');
            return '🔥 Cozy warm lighting activated!';

          case 'party':
            await govee.applyPreset('party');
            return '🎉 Party mode activated!';

          case 'focus':
            await govee.applyPreset('focus');
            return '💡 Focus mode activated!';

          case 'on':
            await govee.controlGroup('light-bulbs', 'devices.capabilities.on_off', 1);
            await govee.controlGroup('light-bars', 'devices.capabilities.on_off', 1);
            await govee.controlGroup('light-strips', 'devices.capabilities.on_off', 1);
            return '🔆 All lights turned ON';

          case 'off':
            await govee.controlGroup('light-bulbs', 'devices.capabilities.on_off', 0);
            await govee.controlGroup('light-bars', 'devices.capabilities.on_off', 0);
            await govee.controlGroup('light-strips', 'devices.capabilities.on_off', 0);
            return '🌙 All lights turned OFF';

          /*  
          case 'fan':
          case 'fan-lights': {
            const fanCommand = args[1]?.toLowerCase();
            if (fanCommand === 'on') {
              await govee.controlGroup('light-bulbs', 'devices.capabilities.on_off', 1);
              return `💡 Fan lights turned ON`;
            } else if (fanCommand === 'off') {
              await govee.controlGroup('light-bulbs', 'devices.capabilities.on_off', 0);
              return `🌙 Fan lights turned OFF`;
            }
            return 'Usage: lights fan <on|off>';
          }

          case 'gaming-bar':
          case 'gaming-bars': {
            const barCommand = args[1]?.toLowerCase();
            if (barCommand === 'on') {
              await govee.controlGroup('light-bars', 'devices.capabilities.on_off', 1);
              return `🎮 Gaming bars turned ON`;
            } else if (barCommand === 'off') {
              await govee.controlGroup('light-bars', 'devices.capabilities.on_off', 0);
              return `🌙 Gaming bars turned OFF`;
            }
            return 'Usage: lights gaming-bar <on|off>';
          }

          case 'strip': {
            const stripCommand = args[1]?.toLowerCase();
            if (stripCommand === 'on') {
              await govee.controlGroup('light-strips', 'devices.capabilities.on_off', 1);
              return `💡 Light strip turned ON`;
            } else if (stripCommand === 'off') {
              await govee.controlGroup('light-strips', 'devices.capabilities.on_off', 0);
              return `🌙 Light strip turned OFF`;
            }
            return 'Usage: lights strip <on|off>';
          }
          */  

          case 'list':
            const devices = await govee.getDevices();
            return formatDeviceList(devices);

          case 'status':
            const statusDevices = await govee.getDevices();
            return `📊 LIGHT STATUS:\nTotal devices: ${statusDevices.length}\nControllable: ${statusDevices.filter(d => d.controllable).length}`;

          case 'debug-groups':
            const groupsData = await govee.getDeviceGroups();
            return `Debug Groups Data:\n${JSON.stringify(groupsData, null, 2)}`;
          
          default:
            return formatHelp(helpConfigs.lights!);
        }
      } catch (error: any) {
        return `❌ Error: ${error.message}`;
      }
    }
  },

  easter: {
    name: 'easter',
    description: 'Find hidden surprises',
    requiresAuth: false,
    execute: (): string => {
      return EASTER_EGGS[Math.floor(Math.random() * EASTER_EGGS.length)] || '';
    }
  },

  uptime: {
    name: 'uptime',
    description: 'Show system uptime',
    requiresAuth: false,
    execute: (): string => {
      return 'System uptime: 42 days, 13 hours, 27 minutes';
    }
  },

  date: {
    name: 'date',
    description: 'Display current date and time',
    requiresAuth: false,
    execute: (): string => {
      return new Date().toString();
    }
  },

  ping: {
    name: 'ping',
    description: 'Test network connectivity',
    requiresAuth: false,
    execute: async (args: string[]): Promise<string> => {
      return 'pong';
    }
  },
};

/* terminal configuration */
export const TERMINAL_CONFIG = {
  PROMPT: {
    GUEST: term.config.prompt.guest,
    AUTHENTICATED: term.config.prompt.auth
  },
  COLORS: {
    INPUT: 'text-green-400',
    OUTPUT: 'text-cyan-300',
    ERROR: 'text-red-400',
    SYSTEM: 'text-purple-400'
  },
} as const;