'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function OAuthTest() {
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    console.log(logEntry)
    setLogs(prev => [...prev, logEntry])
  }

  const testGoogleOAuth = async () => {
    setLoading(true)
    addLog('🚀 Starting Google OAuth test...')
    
    try {
      const supabase = createClient()
      addLog('📦 Supabase client created')
      
      const origin = window.location.origin
      const redirectUrl = `${origin}/auth/callback-debug`
      
      addLog(`🔄 Redirect URL: ${redirectUrl}`)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      })
      
      if (error) {
        addLog(`❌ OAuth error: ${error.message}`)
      } else {
        addLog('✅ OAuth request initiated successfully')
        addLog(`📊 Response data: ${JSON.stringify(data)}`)
      }
      
    } catch (err) {
      addLog(`💥 Exception: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const testGitHubOAuth = async () => {
    setLoading(true)
    addLog('🚀 Starting GitHub OAuth test...')
    
    try {
      const supabase = createClient()
      addLog('📦 Supabase client created')
      
      const origin = window.location.origin
      const redirectUrl = `${origin}/auth/callback-debug`
      
      addLog(`🔄 Redirect URL: ${redirectUrl}`)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl
        }
      })
      
      if (error) {
        addLog(`❌ OAuth error: ${error.message}`)
      } else {
        addLog('✅ OAuth request initiated successfully')
        addLog(`📊 Response data: ${JSON.stringify(data)}`)
      }
      
    } catch (err) {
      addLog(`💥 Exception: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">OAuth Debug Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test OAuth Providers</h2>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={testGoogleOAuth}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Google OAuth'}
            </button>
            
            <button
              onClick={testGitHubOAuth}
              disabled={loading}
              className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test GitHub OAuth'}
            </button>
            
            <button
              onClick={() => setLogs([])}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear Logs
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Current origin: <code className="bg-gray-100 px-1 rounded">{typeof window !== 'undefined' ? window.location.origin : 'Loading...'}</code></p>
            <p>Supabase URL: <code className="bg-gray-100 px-1 rounded">{process.env.NEXT_PUBLIC_SUPABASE_URL}</code></p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Logs ({logs.length})</h2>
          
          {logs.length === 0 ? (
            <p className="text-gray-500 italic">No logs yet. Click a test button to start.</p>
          ) : (
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
