'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function TestAuthPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionInfo, setSessionInfo] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication state...');
        
        // Get current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.log('📋 Session data:', { 
          hasSession: !!sessionData.session, 
          user: sessionData.session?.user?.email,
          error: sessionError 
        });
        
        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        setSessionInfo(sessionData);
        setUser(sessionData.session?.user || null);
        
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser();
        console.log('👤 User data:', { 
          hasUser: !!userData.user, 
          user: userData.user?.email,
          error: userError 
        });
        
        if (userError) {
          setError(userError.message);
          return;
        }

        if (userData.user) {
          setUser(userData.user);
        }
        
      } catch (err) {
        console.error('💥 Error checking auth:', err);
        setError('Failed to check authentication');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        setUser(session?.user || null);
        setSessionInfo({ session });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    console.log('🚪 Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Sign out error:', error);
      setError(error.message);
    } else {
      console.log('✅ Signed out successfully');
      setUser(null);
      setSessionInfo(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking authentication state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Authentication Test Page</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}
          
          {user ? (
            <div className="space-y-6">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">✅</div>
                  <div className="font-bold text-lg">Authentication Successful!</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">User Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
                    <p><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Session Info</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Has Session:</strong> {sessionInfo?.session ? 'Yes' : 'No'}</p>
                    <p><strong>Access Token:</strong> {sessionInfo?.session?.access_token ? 'Present' : 'None'}</p>
                    <p><strong>Expires At:</strong> {sessionInfo?.session?.expires_at ? new Date(sessionInfo.session.expires_at * 1000).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Sign Out
                  </button>
                  <a
                    href="/"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Go to Main Page
                  </a>
                  <a
                    href="/test-simple"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Test Simple Page
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">⚠️</div>
                  <div className="font-bold text-lg">Not Authenticated</div>
                  <p className="mt-2">You are not currently signed in.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-600">Please sign in to continue.</p>
                <a
                  href="/login"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Go to Login
                </a>
              </div>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server rendered'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
