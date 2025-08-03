'use client';

import { useEffect, useState } from 'react';

interface LoadingState {
  component: string;
  timestamp: number;
  duration: number;
}

const loadingStates: Map<string, LoadingState> = new Map();
const listeners: ((states: LoadingState[]) => void)[] = [];

export function registerLoadingState(component: string) {
  const state: LoadingState = {
    component,
    timestamp: Date.now(),
    duration: 0
  };
  
  loadingStates.set(component, state);
  console.log(`🔄 LoadingMonitor: ${component} started loading`);
  
  const interval = setInterval(() => {
    const currentState = loadingStates.get(component);
    if (currentState) {
      currentState.duration = Date.now() - currentState.timestamp;
      listeners.forEach(listener => listener(Array.from(loadingStates.values())));
      
      // Warn about long-running loading states
      if (currentState.duration > 10000) {
        console.warn(`⚠️ LoadingMonitor: ${component} has been loading for ${Math.round(currentState.duration / 1000)}s`);
      }
    }
  }, 1000);

  return () => {
    clearInterval(interval);
    loadingStates.delete(component);
    console.log(`✅ LoadingMonitor: ${component} finished loading after ${Date.now() - state.timestamp}ms`);
    listeners.forEach(listener => listener(Array.from(loadingStates.values())));
  };
}

export default function LoadingMonitor() {
  const [loadingStates, setLoadingStates] = useState<LoadingState[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStates = (states: LoadingState[]) => {
      setLoadingStates(states);
    };
    
    listeners.push(updateStates);
    
    return () => {
      const index = listeners.indexOf(updateStates);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const longRunningStates = loadingStates.filter(state => state.duration > 5000);

  if (!isVisible && longRunningStates.length === 0) {
    return null;
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 z-50 bg-orange-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-orange-700 text-xs animate-pulse"
      >
        ⚠️ Long Loading ({longRunningStates.length})
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-80 bg-white rounded-lg shadow-2xl border overflow-hidden">
      <div className="bg-orange-600 px-3 py-2 flex items-center justify-between">
        <span className="text-white font-bold text-sm">Loading Monitor</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-orange-200 hover:text-white"
        >
          ✕
        </button>
      </div>
      <div className="p-3 max-h-60 overflow-y-auto">
        {loadingStates.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No active loading states</p>
        ) : (
          loadingStates.map((state, index) => (
            <div 
              key={index} 
              className={`mb-2 p-2 rounded text-sm ${
                state.duration > 10000 ? 'bg-red-50 border border-red-200' :
                state.duration > 5000 ? 'bg-orange-50 border border-orange-200' :
                'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="font-medium">{state.component}</div>
              <div className="text-xs text-gray-600">
                Loading for {Math.round(state.duration / 1000)}s
              </div>
              {state.duration > 10000 && (
                <div className="text-xs text-red-600 mt-1">
                  ⚠️ Possibly stuck
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
