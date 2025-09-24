import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { commands, TERMINAL_CONFIG, TERMINAL_MESSAGES } from '../assets/terminal/terminalCommands';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp?: string;
}

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>(
    TERMINAL_MESSAGES.WELCOME.map(content => ({
      type: content === '' ? 'output' : content.includes('TERMINAL') || content.includes('Initializing') || content.includes('Connection') ? 'system' : 'output',
      content
    }))
  );
  
  const [currentInput, setCurrentInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState('guest');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // helper function to check if session is valid
  const isSessionValid = (): boolean => {
    const token = sessionStorage.getItem('ninsys_auth_token');
    const expires = sessionStorage.getItem('ninsys_auth_expires');
    
    if (!token || !expires) return false;
    
    return new Date(expires).getTime() > Date.now();
  };

  const addLine = useCallback((line: TerminalLine) => {
    setLines(prev => [...prev, { ...line, timestamp: new Date().toLocaleTimeString() }]);
  }, []);

  /* function to handle command inputs */
  const handleCommand = useCallback(async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const [commandName, ...args] = trimmed.split(' ');
    const command = commands[commandName!.toLowerCase()];

    addLine({
      type: 'input',
      content: `${currentUser}@ninsys:~$ ${trimmed}`
    });

    if (!command) {
      addLine({
        type: 'error',
        content: TERMINAL_MESSAGES.COMMAND_NOT_FOUND(commandName!)
      });
      return;
    }

    // check authentication for protected commands
    if (command.requiresAuth) {
      if (!isAuthenticated) {
        addLine({
          type: 'error',
          content: TERMINAL_MESSAGES.ACCESS_DENIED(commandName!)
        });
        return;
      }

      // additional session validation for auth-required commands
      if (!isSessionValid()) {
        addLine({
          type: 'error',
          content: 'Session expired. Please login again.'
        });
        // reset auth state
        setIsAuthenticated(false);
        setCurrentUser('guest');
        sessionStorage.removeItem('ninsys_auth_token');
        sessionStorage.removeItem('ninsys_auth_expires');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const result = await command.execute(args, {
        isAuthenticated,
        currentUser,
        history: commandHistory
      }, {
        setLines,
        setIsAuthenticated,
        setCurrentUser
      });

      if (result) {
        addLine({
          type: 'output',
          content: result
        });
      }
    } catch (error: any) {
      // handle authentication errors specifically
      if (error.message?.includes('Session expired') || error.message?.includes('Authentication')) {
        addLine({
          type: 'error',
          content: error.message
        });
        // reset auth state on auth errors
        setIsAuthenticated(false);
        setCurrentUser('guest');
        sessionStorage.removeItem('ninsys_auth_token');
        sessionStorage.removeItem('ninsys_auth_expires');
      } else {
        addLine({
          type: 'error',
          content: TERMINAL_MESSAGES.COMMAND_ERROR(error.message)
        });
      }
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        inputRef.current?.focus();
        setTimeout(() => inputRef.current?.focus(), 50);
      }, 0);
    }
  }, [currentUser, isAuthenticated, commandHistory, addLine]);

  // add authentication check on component mount
  useEffect(() => {
    // check if user has valid session on load
    const checkAuthStatus = () => {
      if (isSessionValid()) {
        setIsAuthenticated(true);
        setCurrentUser('admin'); // or get from token if you store username
      } else {
        // clear any stale tokens
        sessionStorage.removeItem('ninsys_auth_token');
        sessionStorage.removeItem('ninsys_auth_expires');
      }
    };

    checkAuthStatus();
  }, []);

  // auto-scroll to bottom when new lines are added
    useEffect(() => {
    if (terminalRef.current) {
        requestAnimationFrame(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
        });
    }
    }, [lines]);

  // focus input when terminal is clicked
  useEffect(() => {
    const handleClick = () => inputRef.current?.focus();
    const terminal = terminalRef.current;
    terminal?.addEventListener('click', handleClick);
    return () => terminal?.removeEventListener('click', handleClick);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isProcessing) return;

    if (e.key === 'Enter') {
      handleCommand(currentInput);
      setCommandHistory(prev => [...prev, currentInput]);
      setCurrentInput('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
        if (newIndex === commandHistory.length - 1) {
          setHistoryIndex(-1);
          setCurrentInput('');
        } else {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[newIndex] || '');
        }
      }
    }
  }, [currentInput, commandHistory, historyIndex, isProcessing, handleCommand]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-6xl"
        >
          {/* CRT Monitor Frame */}
          <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-8 rounded-3xl shadow-2xl border border-gray-700">
            {/* Screen */}
            <div 
              className="relative bg-black rounded-2xl p-8 overflow-hidden"
              style={{
                background: 'radial-gradient(ellipse at center, #001122 0%, #000000 100%)',
                boxShadow: 'inset 0 0 50px rgba(0, 50, 100, 0.3), inset 0 0 100px rgba(0, 50, 100, 0.1)',
                animation: 'crt-flicker 4s infinite'
              }}
            >
              {/* CRT Scanlines */}
              <div 
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 150, 0.03) 2px, rgba(0, 255, 150, 0.03) 4px)',
                  animation: 'scanlines 0.1s linear infinite'
                }}
              />
              
              {/* CRT Curve effect */}
              <div 
                className="absolute inset-0 pointer-events-none z-20"
                style={{
                  background: 'radial-gradient(ellipse at center, transparent 0%, transparent 85%, rgba(0, 0, 0, 0.3) 100%)',
                }}
              />

              {/* Terminal Content */}
              <div 
                ref={terminalRef}
                className="relative z-30 font-mono text-sm h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent cursor-text p-4"
                style={{
                  textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
                  margin: '8px', // extra margin to prevent glow cutoff
                }}
              >
                {/* Terminal Lines */}
                {lines.map((line, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`mb-1 ${
                      line.type === 'input' ? TERMINAL_CONFIG.COLORS.INPUT :
                      line.type === 'error' ? TERMINAL_CONFIG.COLORS.ERROR :
                      line.type === 'system' ? TERMINAL_CONFIG.COLORS.SYSTEM :
                      TERMINAL_CONFIG.COLORS.OUTPUT
                    }`}
                    style={{
                      filter: 'brightness(1.2)',
                    }}
                  >
                    <pre className="whitespace-pre-wrap break-words">{line.content}</pre>
                  </motion.div>
                ))}

                {/* Current Input Line */}
                <div className={`flex items-center ${TERMINAL_CONFIG.COLORS.INPUT}`}>
                  <span className="mr-2">{currentUser}@ninsys:~$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isProcessing}
                    className={`flex-1 bg-transparent outline-none ${TERMINAL_CONFIG.COLORS.INPUT} caret-green-400`}
                    style={{
                      textShadow: '0 0 10px currentColor',
                    }}
                    autoFocus
                  />
                  {isProcessing && (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="ml-2 text-yellow-400"
                    >
                      Processing...
                    </motion.span>
                  )}
                </div>
              </div>
            </div>

            {/* Monitor Details */}
            <div className="mt-6 flex justify-center">
              <div className="w-40 h-10 bg-gray-700 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                <span className="ml-2 text-sm text-gray-300 font-semibold">ONLINE</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10 inline-block shadow-xl">
              <p className="text-white/70 text-sm mb-3">
                <span className="text-purple-400 font-semibold">Pro tip:</span> Try commands like "help", "about", "status", or "easter"
              </p>
              <p className="text-white/50 text-xs">
                Use ↑/↓ arrows for command history • Click terminal to focus
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes scanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        
        @keyframes crt-flicker {
          0%, 100% { opacity: 1; }
          98% { opacity: 0.98; }
          99% { opacity: 0.99; }
        }
      `}</style>
    </div>
  );
}