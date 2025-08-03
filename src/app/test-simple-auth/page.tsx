'use client';

import { useEffect, useState } from 'react';

export default function TestSimpleAuthPage() {
  const [step, setStep] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testSteps = async () => {
      try {
        setStep('Step 1: Basic React working');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setStep('Step 2: Attempting to import Supabase client...');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Dynamically import to catch any module loading issues
        const { createClient } = await import('@/lib/supabase/client');
        setStep('Step 3: Supabase client imported successfully');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setStep('Step 4: Creating Supabase client instance...');
        const supabase = createClient();
        setStep('Step 5: Supabase client created');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        setStep('Step 6: Attempting to get session...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError(`Session error: ${sessionError.message}`);
          setStep('❌ Session check failed');
          return;
        }
        
        setStep('Step 7: Session check completed');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (sessionData?.session?.user) {
          setStep(`✅ User authenticated: ${sessionData.session.user.email}`);
        } else {
          setStep('⚠️ No authenticated user found');
        }
        
      } catch (err) {
        console.error('Error in test steps:', err);
        setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setStep('❌ Test failed');
      }
    };

    testSteps();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Simple Auth Test</h1>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Current Step:</h3>
              <p className="text-blue-700">{step}</p>
            </div>
            
            {error && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">
                This page tests each step of the authentication process individually.
              </p>
              <a
                href="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Go to Login
              </a>
              <a
                href="/test-minimal"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Test Minimal Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
