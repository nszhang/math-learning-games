'use client';

import { useEffect, useState } from 'react';

export default function TestReactOnlyPage() {
  const [message, setMessage] = useState('Loading...');
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Test basic React functionality
    const timer = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);

    // Test that useEffect runs
    setMessage('React is working! Timer started.');

    return () => clearInterval(timer);
  }, []);

  const handleClick = () => {
    setMessage(`Button clicked at ${new Date().toLocaleTimeString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center">React-Only Test</h1>
          
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Status:</h3>
              <p className="text-green-700">{message}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Timer Counter:</h3>
              <p className="text-blue-700 text-2xl font-bold">{count}</p>
            </div>
            
            <div className="text-center space-y-4">
              <button
                onClick={handleClick}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                Test Button Click
              </button>
              
              <div className="space-x-2">
                <a
                  href="/test-simple-auth"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Test Simple Auth
                </a>
                <a
                  href="/test-auth"
                  className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Test Full Auth
                </a>
                <a
                  href="/test-minimal"
                  className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Test Minimal
                </a>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                This page tests basic React functionality without any Supabase dependencies.
                If this works but auth pages don't, the issue is with Supabase client initialization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
