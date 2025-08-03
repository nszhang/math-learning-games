export default function SimpleTest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Simple Test Page</h1>
        <p className="text-gray-600 mb-4">
          This page loads successfully, which means the deployment is working.
        </p>
        <div className="space-y-2 text-sm">
          <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server-side rendering'}</p>
          <p><strong>Test Status:</strong> ✅ Page loads correctly</p>
          <p><strong>Next Step:</strong> Test actual login flow</p>
        </div>
        
        <div className="mt-6">
          <a 
            href="/" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Main App
          </a>
        </div>
      </div>
    </div>
  );
}
