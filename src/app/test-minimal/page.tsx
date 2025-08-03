export default function TestMinimal() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Minimal Test Page</h1>
        <div className="text-green-600 text-6xl mb-4">✅</div>
        <p className="text-gray-600 mb-4">
          This page loads successfully without any Supabase calls.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          If you see this, the deployment and routing are working correctly.
        </p>
        
        <div className="space-y-3">
          <p className="font-mono text-xs bg-gray-100 p-2 rounded">
            URL: {typeof window !== 'undefined' ? window.location.href : 'Server rendered'}
          </p>
          
          <div className="space-y-2">
            <a 
              href="/test-simple" 
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Test Simple Page
            </a>
            
            <a 
              href="/login" 
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
