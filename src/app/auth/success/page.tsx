'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthSuccessRedirectPage() {
  const [debugLog, setDebugLog] = useState<string[]>(['🎯 Auth success redirect initialized']);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const finalDestination = searchParams.get('next') || '/';

  const addDebugLog = (message: string) => {
    console.log(message);
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const handleAuthRedirect = async () => {
      addDebugLog('🚀 Starting auth success redirect process');
      
      try {
        const supabase = createClient();
        addDebugLog('📦 Supabase client created');

        // Wait a moment for session to propagate
        addDebugLog('⏳ Waiting for session to propagate...');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check for session with retry logic
        let attempts = 0;
        const maxAttempts = 5;
        let sessionFound = false;

        while (attempts < maxAttempts && !sessionFound) {
          attempts++;
          addDebugLog(`🔍 Checking for session (attempt ${attempts}/${maxAttempts})`);

          try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              addDebugLog(`❌ Session check error: ${error.message}`);
            } else if (session && session.user) {
              addDebugLog(`✅ Session found! User: ${session.user.email}`);
              sessionFound = true;
              setIsReady(true);
              
              // Wait longer to ensure client state is fully updated and propagated
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Redirect to server auth test page for testing
              const redirectUrl = '/test-server-auth';
              
              addDebugLog(`🎯 Redirecting to: ${redirectUrl}`);
              router.replace(redirectUrl);
              return;
            } else {
              addDebugLog('⚠️ No session found yet');
            }
          } catch (err) {
            addDebugLog(`💥 Session check failed: ${err}`);
          }

          if (!sessionFound && attempts < maxAttempts) {
            addDebugLog('⏳ Waiting 1 second before retry...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        if (!sessionFound) {
          addDebugLog('❌ Failed to find session after all attempts');
          addDebugLog('🔄 Redirecting to login page');
          router.replace('/login?error=session_not_found');
        }

      } catch (error) {
        addDebugLog(`💥 Auth redirect process failed: ${error}`);
        router.replace('/login?error=auth_redirect_failed');
      }
    };

    handleAuthRedirect();
  }, [router, finalDestination]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="text-center max-w-2xl">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {isReady ? '🎉 Authentication Successful!' : '🔄 Completing Authentication...'}
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          {isReady 
            ? `Redirecting you to ${finalDestination === '/' ? 'the main page' : finalDestination}...`
            : 'Please wait while we finalize your authentication...'
          }
        </p>
        
        {/* Debug Log */}
        <div className="bg-gray-900 text-green-400 text-xs font-mono p-4 rounded-lg text-left max-h-64 overflow-y-auto">
          <h3 className="text-white mb-2 font-bold">🐛 Debug Log:</h3>
          {debugLog.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))}
        </div>
        
        <div className="mt-6">
          <p className="text-sm text-gray-500">
            If this takes too long, you can <a href="/login" className="text-blue-600 hover:underline">try logging in again</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
