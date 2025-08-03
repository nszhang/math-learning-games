'use client'

import { useEffect, useState, useRef } from 'react'

interface MinimalAuthWrapperProps {
  children: React.ReactNode
  expectAuthenticated?: boolean
}

export default function MinimalAuthWrapper({
  children,
  expectAuthenticated = false
}: MinimalAuthWrapperProps) {
  const retrievedSessionRef = useRef(false);
  const [authState, setAuthState] = useState<{
    loading: boolean
    authenticated: boolean
    error: string | null
  }>({
    loading: true,
    authenticated: false,
    error: null
  })

  useEffect(() => {
    console.log('🔄 MinimalAuthWrapper: useEffect triggered');
    console.log('🔄 MinimalAuthWrapper: expectAuthenticated =', expectAuthenticated);
    
    const checkAuth = async (attempt = 1) = {
      try {
        if (retrievedSessionRef.current) {
          console.log('🔄 MinimalAuthWrapper: Session already retrieved, skipping check for attempt', attempt);
          return;
        }

        console.log(`🔍 MinimalAuthWrapper: Starting auth check (attempt ${attempt})...`);

        const response = await fetch('/api/auth/verify', {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        setAuthState({
          loading: false,
          authenticated: data.authenticated,
          error: data.error || null
        });

        if (data.authenticated) {
          retrievedSessionRef.current = true;
          console.log(`✅ MinimalAuthWrapper: Auth check succeeded on attempt ${attempt}`);
        } else {
          throw new Error('Authentication failed');
        }

      } catch (error) {
        console.error('❌ MinimalAuthWrapper: Auth check failed on attempt', attempt, error);
        if (attempt < 3) {
          console.log(`🔄 MinimalAuthWrapper: Retrying auth check in ${attempt} seconds (attempt ${attempt + 1})...`);
          setTimeout(() = checkAuth(attempt + 1), attempt * 1000);
        } else {
          console.warn('⚠️ MinimalAuthWrapper: Max auth attempts reached. Giving up.');
          setAuthState({
            loading: false,
            authenticated: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    };

    // Small delay if expecting authentication to allow session to propagate
    const delay = expectAuthenticated ? 1000 : 0;
    console.log(`⏰ MinimalAuthWrapper: Setting timeout with delay: ${delay}ms`);
    
    const timeoutId = setTimeout(() => {
      console.log('⏰ MinimalAuthWrapper: Timeout triggered, calling checkAuth');
      checkAuth();
    }, delay);
    
    return () => {
      console.log('🧹 MinimalAuthWrapper: Cleanup - clearing timeout');
      clearTimeout(timeoutId);
    };
  }, [expectAuthenticated]);

  console.log('🔄 MinimalAuthWrapper: Render - authState =', authState);
  console.log('🔄 MinimalAuthWrapper: Render - expectAuthenticated =', expectAuthenticated);
  
  if (authState.loading) {
    console.log('⏳ MinimalAuthWrapper: Rendering loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Checking authentication...</p>
          {expectAuthenticated && (
            <p className="text-sm text-gray-400">Expected authenticated user</p>
          )}
        </div>
      </div>
    )
  }

  if (!authState.authenticated) {
    console.log('🚫 MinimalAuthWrapper: Rendering not authenticated state');
    console.log('🚫 MinimalAuthWrapper: Auth error:', authState.error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
          {authState.error && (
            <p className="text-red-600 text-sm">Error: {authState.error}</p>
          )}
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  console.log('✅ MinimalAuthWrapper: Rendering authenticated children');
  return <>{children}</>;
}
