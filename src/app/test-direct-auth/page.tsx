'use client'

import { useEffect, useState } from 'react'

export default function TestDirectAuth() {
  const [status, setStatus] = useState('Checking authentication...')
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setStatus('Making auth request...')
        
        const response = await fetch('/api/auth/verify')
        const data = await response.json()
        
        setDetails(data)
        
        if (data.authenticated) {
          setStatus(`✅ Authenticated as ${data.user.email}`)
        } else {
          setStatus('❌ Not authenticated')
        }
      } catch (error) {
        setStatus(`💥 Error: ${error}`)
        setDetails({ error: String(error) })
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Direct Auth Test</h1>
        
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <h2 className="font-semibold mb-2">Status:</h2>
          <p className="text-lg">{status}</p>
        </div>
        
        {details && (
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <h2 className="font-semibold mb-2">Details:</h2>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
          
          <button 
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Go to Main App
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}
