'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function DebugAuth() {
  const [logs, setLogs] = useState<string[]>([]);
  const supabase = createClient();

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const testGoogleAuth = async () => {
    addLog('🚀 Starting Google OAuth test...');
    addLog(`📍 Current origin: ${window.location.origin}`);
    addLog(`📍 Redirect URL will be: ${window.location.origin}/auth/callback`);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        addLog(`❌ OAuth error: ${error.message}`);
      } else {
        addLog(`✅ OAuth initiated successfully`);
        addLog(`📋 OAuth data: ${JSON.stringify(data)}`);
      }
    } catch (err) {
      addLog(`💥 Exception: ${err}`);
    }
  };

  const checkSupabaseConfig = async () => {
    addLog('🔍 Checking Supabase configuration...');
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        addLog(`❌ Session error: ${error.message}`);
      } else if (session) {
        addLog(`✅ Active session found for: ${session.user.email}`);
      } else {
        addLog(`ℹ️ No active session`);
      }
    } catch (err) {
      addLog(`💥 Session check exception: ${err}`);
    }

    // Check environment variables
    addLog(`🔧 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    addLog(`🔧 Supabase Anon Key (first 20 chars): ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...`);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">OAuth Debug Page</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testGoogleAuth}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Test Google OAuth
          </button>
          
          <button
            onClick={checkSupabaseConfig}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Check Supabase Config
          </button>
          
          <button
            onClick={() => setLogs([])}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Clear Logs
          </button>
        </div>

        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-96 overflow-y-auto">
          <div className="mb-2 text-yellow-400">🔍 Debug Console:</div>
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet. Click a button to start testing.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          )}
        </div>

        <div className="mt-8 p-4 bg-yellow-100 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">Current Settings to Verify:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Loading...'}</li>
            <li><strong>Expected Callback:</strong> {typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'Loading...'}</li>
            <li><strong>Action Required:</strong> Update Supabase Auth → URL Configuration with current URL</li>
            <li><strong>Action Required:</strong> Update Google OAuth settings with current URL</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
