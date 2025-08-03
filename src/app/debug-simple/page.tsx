'use client'

import { useSearchParams } from 'next/navigation'

export default function DebugSimple() {
  const searchParams = useSearchParams()
  const callback = searchParams.get('callback')
  const hasCode = searchParams.get('hasCode')
  const hasError = searchParams.get('hasError')
  
  return (
    <div className="min-h-screen p-8 bg-blue-50">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">
          🎯 Debug Simple Page Loaded!
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <p className="text-lg text-gray-700 mb-4">
            If you can see this page, it means:
          </p>
          <ul className="text-left space-y-2 text-gray-600">
            <li>✅ The OAuth callback completed successfully</li>
            <li>✅ The redirect from /auth/callback worked</li>
            <li>✅ This page loaded without hanging</li>
            <li>✅ No authentication wrapper interference</li>
          </ul>
        </div>
        
        {callback && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h2 className="font-semibold text-green-800 mb-2">Callback Info:</h2>
            <div className="text-sm text-green-700 space-y-1">
              <p>Callback: {callback}</p>
              <p>Has Code: {hasCode}</p>
              <p>Has Error: {hasError}</p>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Current URL: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{typeof window !== 'undefined' ? window.location.href : 'Loading...'}</span>
          </p>
          
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/test-direct-auth'}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Auth Status
            </button>
            
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
