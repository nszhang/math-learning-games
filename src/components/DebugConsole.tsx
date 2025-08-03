'use client';

import { useState, useEffect } from 'react';

interface DebugLog {
  timestamp: string;
  message: string;
  level: 'log' | 'warn' | 'error';
}

const debugLogs: DebugLog[] = [];
const listeners: ((logs: DebugLog[]) => void)[] = [];

// Override console methods to capture logs
if (typeof window !== 'undefined') {
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = (...args: any[]) => {
    originalLog(...args);
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    debugLogs.push({
      timestamp: new Date().toLocaleTimeString(),
      message,
      level: 'log'
    });
    
    // Keep only last 100 logs
    if (debugLogs.length > 100) {
      debugLogs.shift();
    }
    
    listeners.forEach(listener => listener([...debugLogs]));
  };

  console.warn = (...args: any[]) => {
    originalWarn(...args);
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    debugLogs.push({
      timestamp: new Date().toLocaleTimeString(),
      message,
      level: 'warn'
    });
    
    if (debugLogs.length > 100) {
      debugLogs.shift();
    }
    
    listeners.forEach(listener => listener([...debugLogs]));
  };

  console.error = (...args: any[]) => {
    originalError(...args);
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    debugLogs.push({
      timestamp: new Date().toLocaleTimeString(),
      message,
      level: 'error'
    });
    
    if (debugLogs.length > 100) {
      debugLogs.shift();
    }
    
    listeners.forEach(listener => listener([...debugLogs]));
  };
}

export default function DebugConsole() {
  const [logs, setLogs] = useState<DebugLog[]>(debugLogs);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateLogs = (newLogs: DebugLog[]) => {
      setLogs(newLogs);
    };
    
    listeners.push(updateLogs);
    
    return () => {
      const index = listeners.indexOf(updateLogs);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 text-sm"
      >
        Show Debug Console
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-80 bg-black text-green-400 rounded-lg shadow-2xl overflow-hidden font-mono text-xs">
      <div className="bg-gray-800 px-3 py-2 flex items-center justify-between">
        <span className="text-white font-bold">Debug Console</span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              debugLogs.length = 0;
              setLogs([]);
            }}
            className="text-yellow-400 hover:text-yellow-300"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="p-2 h-full overflow-y-auto bg-black">
        {logs.map((log, index) => (
          <div 
            key={index} 
            className={`mb-1 ${
              log.level === 'error' ? 'text-red-400' : 
              log.level === 'warn' ? 'text-yellow-400' : 
              'text-green-400'
            }`}
          >
            <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-500 italic">No logs yet...</div>
        )}
      </div>
    </div>
  );
}
