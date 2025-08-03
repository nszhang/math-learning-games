import ServerAuthWrapper from '@/components/ServerAuthWrapper'

export default function TestServerAuth() {
  return (
    <ServerAuthWrapper
      expectAuthenticated={false}
      maxRetries={3}
      retryDelay={1000}
    >
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold text-gray-800">
            🎉 Server Auth Test Success!
          </h1>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              You are successfully authenticated using server-side session verification!
            </p>
          </div>
          
          <div className="space-y-4 text-left bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold text-gray-800">How this works:</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Authentication state is verified server-side via API route</li>
              <li>• No direct Supabase client calls on the client side</li>
              <li>• Retry logic handles session propagation delays</li>
              <li>• Consistent authentication status across all pages</li>
            </ul>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Main App
            </button>
            
            <button 
              onClick={() => window.location.href = '/api/auth/signout'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </ServerAuthWrapper>
  )
}
