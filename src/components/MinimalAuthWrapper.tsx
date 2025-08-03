'use client'

import { useEffect, useState } from 'react'

interface MinimalAuthWrapperProps {
  children: React.ReactNode
  expectAuthenticated?: boolean
}

export default function MinimalAuthWrapper({
  children,
  expectAuthenticated = false
}: MinimalAuthWrapperProps) {
  const [authState, setAuthState] = useState<{
    loading: boolean
    authenticated: boolean
    error: string | null
  }>({
    loading: true,
    authenticated: false,
    error: null
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 MinimalAuthWrapper: Checking auth status...')
        
        const response = await fetch('/api/auth/verify', {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        
        const data = await response.json()
        console.log('📊 MinimalAuthWrapper: Server response:', data)
        
        setAuthState({
          loading: false,
          authenticated: data.authenticated,
          error: data.error || null
        })
        
        console.log(`✅ MinimalAuthWrapper: Auth check complete - authenticated: ${data.authenticated}`)
        
      } catch (error) {
        console.error('❌ MinimalAuthWrapper: Auth check failed:', error)
        setAuthState({
          loading: false,
          authenticated: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Small delay if expecting authentication to allow session to propagate
    const delay = expectAuthenticated ? 1000 : 0
    setTimeout(checkAuth, delay)
  }, [expectAuthenticated])

  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Checking authentication...</p>
          {expectAuthenticated && (
            <p className="text-sm text-gray-400">Expected authenticated user</p>
          )}
        </div>
      </div>
    )
  }

  if (!authState.authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to access this page.</p>
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
      </div>
    )
  }

  return <>{children}</>
}
