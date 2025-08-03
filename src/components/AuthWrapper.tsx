'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  expectAuthenticated?: boolean; // Flag to indicate we expect user to be authenticated
}

export default function AuthWrapper({ children, fallback, expectAuthenticated = false }: AuthWrapperProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugLog, setDebugLog] = useState<string[]>(['🔄 AuthWrapper initialized']);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const addDebugLog = (message: string) => {
    console.log(message);
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addDebugLog('🚀 AuthWrapper useEffect starting');
    
    let supabase: any;
    let timeoutId: NodeJS.Timeout;
    let isComponentMounted = true;
    let authListenerSetup = false;
    
    // Set up a timeout to prevent infinite loading
    // Always give more time now since we've seen timing issues
    const timeoutMs = 15000;
    timeoutId = setTimeout(() => {
      if (isComponentMounted && loading) {
        addDebugLog(`⏰ Session check timed out after ${timeoutMs/1000} seconds`);
        setHasTimedOut(true);
        setLoading(false);
      }
    }, timeoutMs);
    
    try {
      addDebugLog('📦 Creating Supabase client...');
      supabase = createClient();
      addDebugLog('✅ Supabase client created successfully');
    } catch (error) {
      addDebugLog(`❌ Failed to create Supabase client: ${error}`);
      if (timeoutId) clearTimeout(timeoutId);
      setLoading(false);
      return;
    }

    // Set up auth state change listener FIRST - this is more reliable
    addDebugLog('👂 Setting up auth state change listener...');
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isComponentMounted) {
        const userEmail = session?.user?.email || 'No user';
        addDebugLog(`🔄 Auth state changed: ${event} - ${userEmail}`);
        setUser(session?.user ?? null);
        if (timeoutId) clearTimeout(timeoutId);
        setLoading(false);
      }
    });
    authListenerSetup = true;
    addDebugLog('🔗 Auth state change listener set up');

    // Get initial session with more aggressive retry logic
    const getInitialSession = async (attempt = 1) => {
      try {
        addDebugLog(`🔍 Getting initial session (attempt ${attempt})...`);
        
        // Use a longer timeout for session calls
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session request timeout')), 8000)
        );
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
        addDebugLog('📋 Session response received');
        
        if (error) {
          addDebugLog(`❌ Error getting session: ${error.message}`);
          // Retry up to 3 times
          if (attempt < 3) {
            addDebugLog(`🔄 Retrying session check in ${attempt} second(s)...`);
            setTimeout(() => {
              if (isComponentMounted) {
                getInitialSession(attempt + 1);
              }
            }, attempt * 1000);
            return;
          }
        } else {
          const userEmail = session?.user?.email || 'No user';
          if (isComponentMounted) {
            setUser(session?.user ?? null);
            addDebugLog(`✅ Initial session check: ${userEmail}`);
            if (timeoutId) clearTimeout(timeoutId);
            setLoading(false);
            return; // Success! Exit early
          }
        }
      } catch (error) {
        addDebugLog(`💥 Session check failed: ${error}`);
        // Retry up to 3 times
        if (attempt < 3) {
          addDebugLog(`🔄 Retrying session check in ${attempt} second(s)...`);
          setTimeout(() => {
            if (isComponentMounted) {
              getInitialSession(attempt + 1);
            }
          }, attempt * 1000);
          return;
        }
      }
      
      // If we get here, all attempts failed, but don't set loading to false yet
      // The auth state listener might still detect the session
      addDebugLog('⚠️ Initial session check failed, but auth listener is still active');
    };

    // Start with a small delay to let any auth state changes settle
    setTimeout(() => {
      if (isComponentMounted) {
        addDebugLog('🎯 Starting initial session check...');
        getInitialSession();
      }
    }, 100);

    return () => {
      addDebugLog('🧹 Cleaning up subscription');
      isComponentMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (authListenerSetup) {
        subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center max-w-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 mb-6">
            {hasTimedOut ? '⚠️ Authentication check timed out' : 'Loading Authentication...'}
          </p>
          
          {hasTimedOut && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
              <p className="font-bold">Session check timed out</p>
              <p className="text-sm mt-2">This might be a temporary issue. Try refreshing the page or clearing your browser cache.</p>
              <div className="mt-4 space-x-2">
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  Refresh Page
                </button>
                <a 
                  href="/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  Go to Login
                </a>
              </div>
            </div>
          )}
          
          {/* Debug Log */}
          <div className="bg-gray-900 text-green-400 text-xs font-mono p-4 rounded-lg text-left max-h-64 overflow-y-auto">
            <h3 className="text-white mb-2 font-bold">🐛 Debug Log:</h3>
            {debugLog.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to access the math games.</p>
          <a 
            href="/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Pass the user to children via React context or props
  return <div data-user={user.email}>{children}</div>;
}
