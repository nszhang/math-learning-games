'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function TestAuthSuccess() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication status...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          setError(error.message);
        } else if (session && session.user) {
          console.log('✅ User authenticated:', session.user.email);
          setUser(session.user);
        } else {
          console.log('❌ No authenticated user found');
          setError('No authenticated user found');
        }
      } catch (err) {
        console.error('💥 Auth check failed:', err);
        setError('Authentication check failed');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Authentication Test</h1>
        
        {user ? (
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-green-700 mb-2">Success!</h2>
            <p className="text-gray-600 mb-4">You are authenticated as:</p>
            <p className="font-mono bg-gray-100 p-2 rounded text-sm mb-4">{user.email}</p>
            <p className="text-gray-600 mb-6">User ID: {user.id}</p>
            
            <div className="space-y-3">
              <a 
                href="/" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded block text-center"
              >
                Go to Main App
              </a>
              
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-red-700 mb-2">Not Authenticated</h2>
            {error && (
              <p className="text-red-600 mb-4 text-sm">{error}</p>
            )}
            <a 
              href="/login" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Go to Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
