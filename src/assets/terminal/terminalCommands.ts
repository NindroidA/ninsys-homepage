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
  // Site-wide auth context
  isSiteAuthenticated?: boolean;
  isGuestViewMode?: boolean;
}

export interface CommandSetters {
  setLines?: (callback: (prev: any[]) => any[]) => void;
  setIsAuthenticated?: (auth: boolean) => void;
  setCurrentUser?: (user: string) => void;
  toggleGuestView?: () => void;
}

export interface Command {
  name: string;
  description: string;
  requiresAuth: boolean;
  execute: (args: string[], terminal: TerminalState, setters?: CommandSetters) => string | Promise<string> | void;
}

export const TERMINAL_MESSAGES = {
  WELCOME: [
    `NINDROID SYSTEMS TERMINAL v${term.version}`,
    'Initializing interface ...',
    'Connection established.',
    '',
    'Welcome to Nindroid Systems! Type "help" for available commands.',
    'Use "login <6-digit-code>" to authenticate with your authenticator app.',
    ''
  ],
  AUTH_SUCCESS: 'Authentication successful! Session active for 24 hours.',
  AUTH_FAILED: 'Authentication failed. Usage: login <6-digit-code>',
  AUTH_ALREADY: 'Already authenticated! Use "logout" to end session.',
  LOGOUT_SUCCESS: 'Session ended. Logged out successfully.',
  ACCESS_DENIED: (cmd: string) => `Access denied: '${cmd}' requires authentication. Use 'login <6-digit-code>' first.`,
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
    description: 'Authenticate with TOTP code',
    requiresAuth: false,
    execute: async (args: string[], state: TerminalState, setters?: CommandSetters): Promise<string> => {
      // Check if already authenticated via site login
      if (state.isSiteAuthenticated && !state.isGuestViewMode) {
        return 'Already authenticated via site login! Admin features are active.';
      }

      if (state.isAuthenticated) {
        return TERMINAL_MESSAGES.AUTH_ALREADY;
      }

      const totpCode = args[0];
      if (!totpCode) {
        return 'Usage: login <6-digit-code>\nGet the code from your authenticator app.';
      }

      // validate TOTP code format
      if (!/^\d{6}$/.test(totpCode)) {
        return 'Invalid code format. Please enter a 6-digit code from your authenticator app.';
      }
      
      try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code: totpCode })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          // store JWT token in sessionStorage
          sessionStorage.setItem('ninsys_auth_token', result.data.token);
          sessionStorage.setItem('ninsys_auth_expires', result.data.expires);
          
          setters?.setIsAuthenticated?.(true);
          setters?.setCurrentUser?.(result.data.user || 'admin');
          
          return TERMINAL_MESSAGES.AUTH_SUCCESS;
        } else {
          return `Authentication failed: ${result.error || 'Invalid code'}`;
        }
      } catch (error) {
        return 'Authentication error. Please check your connection and try again.';
      }
    }
  },

  logout: {
    name: 'logout',
    description: 'Clear authentication and end session',
    requiresAuth: false,
    execute: async (args: string[], state: TerminalState, setters?: CommandSetters): Promise<string> => {
      // If site-authenticated (and not in guest view), logout is disabled
      // User should use the site logout button instead
      if (state.isSiteAuthenticated && !state.isGuestViewMode) {
        return 'Cannot logout from terminal while site-authenticated.\nUse the admin logout button or toggle "View as Guest" mode.';
      }

      // If in guest view mode and authenticated via terminal, just clear terminal auth
      if (state.isGuestViewMode && state.isAuthenticated) {
        setters?.setIsAuthenticated?.(false);
        setters?.setCurrentUser?.('guest');
        return 'Terminal session cleared. You are still site-authenticated in guest view mode.';
      }

      // Normal logout flow
      try {
        const token = sessionStorage.getItem('ninsys_auth_token');
        if (token) {
          await fetch(`${API_BASE}/api/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      } catch (error) {
        // ignore logout API errors, clear session anyway
      }

      // clear stored tokens
      sessionStorage.removeItem('ninsys_auth_token');
      sessionStorage.removeItem('ninsys_auth_expires');

      setters?.setIsAuthenticated?.(false);
      setters?.setCurrentUser?.('guest');
      return TERMINAL_MESSAGES.LOGOUT_SUCCESS;
    }
  },

  status: {
    name: 'status',
    description: 'Check system and authentication status',
    requiresAuth: false,
    execute: async (args: string[]): Promise<string> => {
      try {
        // check auth status
        const token = sessionStorage.getItem('ninsys_auth_token');
        const expires = sessionStorage.getItem('ninsys_auth_expires');
        
        let authStatus = 'Not authenticated';
        if (token) {
          try {
            const response = await fetch(`${API_BASE}/api/auth/status`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data.authenticated) {
                const remainingHours = Math.floor(result.data.remaining / (1000 * 60 * 60));
                const remainingMinutes = Math.floor((result.data.remaining % (1000 * 60 * 60)) / (1000 * 60));
                authStatus = `Authenticated (${remainingHours}h ${remainingMinutes}m remaining)`;
              }
            }
          } catch (error) {
            authStatus = 'Authentication expired';
          }
        }

        return `
  SYSTEM STATUS
  =============
  Authentication: ${authStatus}
  Services: API Connected
  Terminal: Online
        `;
      } catch (error) {
        return `Error checking status: ${error}`;
      }
    }
  },

  debug: {
    name: 'debug',
    description: 'Debug authentication status',
    requiresAuth: false,
    execute: (): string => {
      const token = sessionStorage.getItem('ninsys_auth_token');
      const expires = sessionStorage.getItem('ninsys_auth_expires');
      
      return `
  DEBUG INFO:
  Token exists: ${!!token}
  Token length: ${token?.length || 0}
  Token starts: ${token?.substring(0, 10)}...
  Expires: ${expires}
  Valid until: ${expires ? new Date(expires).toLocaleString() : 'N/A'}
  Current time: ${new Date().toLocaleString()}
  Still valid: ${expires ? new Date(expires).getTime() > Date.now() : false}
      `;
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
    execute: async (): Promise<string> => {
      return 'pong';
    }
  },

  viewguest: {
    name: 'viewguest',
    description: 'Toggle guest view mode (view site as guest)',
    requiresAuth: false,
    execute: (_args: string[], state: TerminalState, setters?: CommandSetters): string => {
      if (!state.isSiteAuthenticated) {
        return 'Guest view mode is only available when site-authenticated.\nLogin via the admin button first.';
      }

      setters?.toggleGuestView?.();

      if (state.isGuestViewMode) {
        return 'Exiting guest view mode. Admin features restored.';
      } else {
        return 'Entering guest view mode. Viewing site as a guest would see it.\nTerminal auth reset to guest. Use "viewguest" again to exit.';
      }
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