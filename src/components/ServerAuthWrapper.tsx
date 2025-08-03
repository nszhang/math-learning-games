'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

interface ServerAuthState {
  loading: boolean
  authenticated: boolean
  user: User | null
  error: string | null
  lastChecked: string | null
}

interface ServerAuthWrapperProps {
  children: React.ReactNode
  loadingComponent?: React.ReactNode
  unauthenticatedComponent?: React.ReactNode
  expectAuthenticated?: boolean
  maxRetries?: number
  retryDelay?: number
}

export default function ServerAuthWrapper({
  children,
  loadingComponent,
  unauthenticatedComponent,
  expectAuthenticated = false,
  maxRetries = 5,
  retryDelay = 1000
}: ServerAuthWrapperProps) {
  const [authState, setAuthState] = useState<ServerAuthState>({
    loading: true,
    authenticated: false,
    user: null,
    error: null,
    lastChecked: null
  })
  
  const [retryCount, setRetryCount] = useState(0)
  const [debugLogs, setDebugLogs] = useState<string[]>([])

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    console.log('🔍 ServerAuthWrapper:', logMessage)
    setDebugLogs(prev => [...prev.slice(-10), logMessage]) // Keep last 10 logs
  }

  const checkAuthStatus = async () => {
    try {
      addDebugLog(`Checking auth status (attempt ${retryCount + 1}/${maxRetries})`)
      
      const response = await fetch('/api/auth/verify', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      addDebugLog(`Server response: ${JSON.stringify(data)}`)
      
      setAuthState({
        loading: false,
        authenticated: data.authenticated,
        user: data.user || null,
        error: data.error || null,
        lastChecked: data.timestamp
      })
      
      if (data.authenticated) {
        addDebugLog(`✅ Authentication verified for user: ${data.user?.email}`)
        return true
      } else if (expectAuthenticated && retryCount < maxRetries - 1) {
        addDebugLog(`⏳ Expected auth but not found, will retry in ${retryDelay}ms`)
        return false
      } else {
        addDebugLog('❌ User not authenticated')
        return true // Don't retry if not expecting auth
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addDebugLog(`💥 Auth check failed: ${errorMessage}`)
      
      if (retryCount < maxRetries - 1) {
        addDebugLog(`Will retry in ${retryDelay}ms`)
        return false
      } else {
        setAuthState({
          loading: false,
          authenticated: false,
          user: null,
          error: errorMessage,
          lastChecked: new Date().toISOString()
        })
        return true
      }
    }
  }

  useEffect(() => {
    addDebugLog('ServerAuthWrapper mounted')
    
    const performAuthCheck = async () => {
      const shouldStop = await checkAuthStatus()
      
      if (!shouldStop && retryCount < maxRetries - 1) {
        setRetryCount(prev => prev + 1)
        setTimeout(performAuthCheck, retryDelay * (retryCount + 1)) // Exponential backoff
      }
    }
    
    performAuthCheck()
  }, [retryCount, expectAuthenticated, maxRetries, retryDelay])

  // Reset retry count when expectAuthenticated changes
  useEffect(() => {
    if (expectAuthenticated) {
      addDebugLog('Expecting authentication, resetting retry count')
      setRetryCount(0)
      setAuthState(prev => ({ ...prev, loading: true }))
    }
  }, [expectAuthenticated])

  if (authState.loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {loadingComponent || (
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Verifying authentication...</p>
            <p className="text-sm text-gray-400">
              Attempt {retryCount + 1} of {maxRetries}
              {expectAuthenticated && ' (expecting authenticated user)'}
            </p>
          </div>
        )}
        
        {/* Debug info */}
        <div className="mt-8 max-w-2xl w-full">
          <details className="bg-gray-50 p-4 rounded-lg">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Debug Info ({debugLogs.length} logs)
            </summary>
            <div className="mt-2 space-y-1 text-xs font-mono text-gray-600 max-h-32 overflow-y-auto">
              {debugLogs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </details>
        </div>
      </div>
    )
  }

  if (!authState.authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        {unauthenticatedComponent || (
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access this page.</p>
            {authState.error && (
              <p className="text-red-600 text-sm">Error: {authState.error}</p>
            )}
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        )}
        
        {/* Debug info */}
        <div className="mt-8 max-w-2xl w-full">
          <details className="bg-gray-50 p-4 rounded-lg">
            <summary className="cursor-pointer text-sm font-medium text-gray-700">
              Debug Info
            </summary>
            <div className="mt-2 text-xs font-mono text-gray-600 space-y-1">
              <div>Last checked: {authState.lastChecked}</div>
              <div>Authenticated: {authState.authenticated.toString()}</div>
              <div>Error: {authState.error || 'None'}</div>
              <div>Retries attempted: {retryCount}</div>
              <div>Expected auth: {expectAuthenticated.toString()}</div>
            </div>
          </details>
        </div>
      </div>
    )
  }

  // User is authenticated, render children
  return <>{children}</>
}
