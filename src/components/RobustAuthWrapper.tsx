'use client';

import { useEffect } from 'react';
import { useAuthState } from '@/hooks/useAuthState';
import { registerLoadingState } from '@/components/LoadingMonitor';

interface RobustAuthWrapperProps {
  children: React.ReactNode;
  expectAuthenticated?: boolean;
}

export default function RobustAuthWrapper({ 
  children, 
  expectAuthenticated = false 
}: RobustAuthWrapperProps) {
  const { 
    loading, 
    authenticated, 
    error, 
    attempts, 
    retryAuth, 
    isCircuitBreakerOpen 
  } = useAuthState({ 
    expectAuthenticated,
    maxAttempts: 3,
    retryDelay: 1000,
    timeout: 8000
  });

  // Register loading state with the monitor
  useEffect(() => {
    if (loading) {
      const cleanup = registerLoadingState('RobustAuthWrapper');
      return cleanup;
    }
  }, [loading]);

  console.log('🛡️ RobustAuthWrapper: Render state =', { 
    loading, 
    authenticated, 
    error, 
    attempts, 
    isCircuitBreakerOpen 
  });

  if (loading) {
    console.log('⏳ RobustAuthWrapper: Rendering loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center space-y-6 max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <div>
            <p className="text-lg text-gray-700 font-medium">Checking authentication...</p>
            {expectAuthenticated && (
              <p className="text-sm text-gray-500 mt-2">Expected authenticated user</p>
            )}
            {attempts > 1 && (
              <p className="text-sm text-orange-600 mt-2">
                Retry attempt {attempts}/3
              </p>
            )}
          </div>
          
          {/* Progress indicator */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(attempts * 33, 100)}%` }}
            ></div>
          </div>
          
          {attempts > 2 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Authentication is taking longer than expected. Please wait...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!authenticated) {
    console.log('🚫 RobustAuthWrapper: Rendering not authenticated state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl mb-4">🔐</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
            <p className="text-gray-600">You need to be logged in to access the math games.</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Error:</strong> {error}
              </p>
              {attempts >= 3 && (
                <p className="text-xs text-red-600 mt-2">
                  Failed after {attempts} attempts
                </p>
              )}
            </div>
          )}
          
          {isCircuitBreakerOpen && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>Service Temporarily Unavailable</strong>
              </p>
              <p className="text-xs text-orange-600 mt-2">
                The authentication service is experiencing issues. Please try again later.
              </p>
            </div>
          )}
          
          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Go to Login
            </button>
            
            {(error || isCircuitBreakerOpen) && (
              <button
                onClick={retryAuth}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors"
              >
                Retry Authentication
              </button>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('✅ RobustAuthWrapper: Rendering authenticated children');
  return <>{children}</>;
}
