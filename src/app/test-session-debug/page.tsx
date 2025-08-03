'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SessionDebugPage() {
  const [logs, setLogs] = useState<string[]>(['🔧 Session debug started']);
  const [sessionData, setSessionData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testSession = async () => {
      addLog('🚀 Starting session debug test');
      
      try {
        const supabase = createClient();
        addLog('📦 Supabase client created');

        // Test 1: Direct session check
        addLog('🔍 Test 1: Direct session check');
        const { data: sessionData1, error: error1 } = await supabase.auth.getSession();
        addLog(`📋 Session data: ${sessionData1.session ? 'Found' : 'None'}`);
        addLog(`👤 User: ${sessionData1.session?.user?.email || 'None'}`);
        if (error1) addLog(`❌ Error: ${error1.message}`);

        setSessionData(sessionData1);

        // Test 2: User check
        addLog('🔍 Test 2: User check');
        const { data: userData, error: error2 } = await supabase.auth.getUser();
        addLog(`👤 User data: ${userData.user ? 'Found' : 'None'}`);
        addLog(`📧 Email: ${userData.user?.email || 'None'}`);
        if (error2) addLog(`❌ Error: ${error2.message}`);

        // Test 3: Auth state listener
        addLog('🔍 Test 3: Setting up auth state listener');
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          addLog(`🔄 Auth state change: ${event} - User: ${session?.user?.email || 'None'}`);
        });

        // Test 4: Wait and check again
        setTimeout(async () => {
          addLog('🔍 Test 4: Re-checking session after 2 seconds');
          const { data: sessionData2, error: error3 } = await supabase.auth.getSession();
          addLog(`📋 Session data (retry): ${sessionData2.session ? 'Found' : 'None'}`);
          addLog(`👤 User (retry): ${sessionData2.session?.user?.email || 'None'}`);
          if (error3) addLog(`❌ Error (retry): ${error3.message}`);
          
          setIsLoading(false);
        }, 2000);

        return () => {
          subscription.unsubscribe();
        };

      } catch (error) {
        addLog(`💥 Test failed: ${error}`);
        setIsLoading(false);
      }
    };

    testSession();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">🔧 Session Debug Test</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Debug Log */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Debug Log</h2>
              <div className="bg-gray-900 text-green-400 text-xs font-mono p-4 rounded-lg max-h-96 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">{log}</div>
                ))}
              </div>
            </div>

            {/* Session Data */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Session Data</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                {isLoading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p>Testing session...</p>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <p><strong>Has Session:</strong> {sessionData?.session ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>User Email:</strong> {sessionData?.session?.user?.email || 'None'}</p>
                    <p><strong>User ID:</strong> {sessionData?.session?.user?.id || 'None'}</p>
                    <p><strong>Access Token:</strong> {sessionData?.session?.access_token ? '✅ Present' : '❌ None'}</p>
                    <p><strong>Expires At:</strong> {sessionData?.session?.expires_at ? 
                      new Date(sessionData.session.expires_at * 1000).toLocaleString() : 'None'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Refresh Test
            </button>
            <a 
              href="/"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Go to Main Page
            </a>
            <a 
              href="/login"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
