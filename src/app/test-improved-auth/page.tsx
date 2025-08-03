'use client';

import AuthWrapper from '@/components/AuthWrapper';

export default function TestImprovedAuthPage() {
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">🎉 Authentication Successful!</h1>
            
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              <div className="text-center">
                <div className="text-4xl mb-2">✅</div>
                <div className="font-bold text-lg">Improved AuthWrapper Test</div>
                <p className="mt-2">You are successfully authenticated using the improved AuthWrapper with timeout protection and retry logic!</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href="/test-auth"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center"
                >
                  Regular Test Auth
                </a>
                <a
                  href="/test-simple"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-center"
                >
                  Simple Test Page
                </a>
                <a
                  href="/"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded text-center"
                >
                  Main App
                </a>
                <a
                  href="/login"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-center"
                >
                  Login Page
                </a>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Current URL: {typeof window !== 'undefined' ? window.location.href : 'Server rendered'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                This page uses the improved AuthWrapper with timeout protection and retry logic.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
