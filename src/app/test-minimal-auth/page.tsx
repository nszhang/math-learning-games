import MinimalAuthWrapper from '@/components/MinimalAuthWrapper'

export default function TestMinimalAuth() {
  return (
    <MinimalAuthWrapper expectAuthenticated={false}>
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold text-green-600">
            🎉 Minimal Auth Success!
          </h1>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              You are successfully authenticated with the minimal auth wrapper!
            </p>
          </div>
          
          <div className="space-y-4 text-left bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold text-gray-800">This approach:</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Makes a single server-side auth verification call</li>
              <li>• No complex retry logic or event listeners</li>
              <li>• Simple loading → authenticated/unauthenticated flow</li>
              <li>• Direct redirect from OAuth callback to main page</li>
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
    </MinimalAuthWrapper>
  )
}
