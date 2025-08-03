'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface AuthState {
  loading: boolean;
  authenticated: boolean;
  error: string | null;
  attempts: number;
}

interface UseAuthStateOptions {
  expectAuthenticated?: boolean;
  maxAttempts?: number;
  retryDelay?: number;
  timeout?: number;
}

export function useAuthState(options: UseAuthStateOptions = {}) {
  const {
    expectAuthenticated = false,
    maxAttempts = 3,
    retryDelay = 1000,
    timeout = 10000
  } = options;

  const [authState, setAuthState] = useState<AuthState>({
    loading: true,
    authenticated: false,
    error: null,
    attempts: 0
  });

  const circuitBreakerRef = useRef({
    isOpen: false,
    failures: 0,
    lastFailure: 0,
    resetTimeout: 30000 // 30 seconds
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isCheckingRef = useRef(false);

  const checkAuth = useCallback(async (attempt = 1): Promise<void> => {
    const circuitBreaker = circuitBreakerRef.current;
    
    // Circuit breaker check
    if (circuitBreaker.isOpen) {
      const timeSinceLastFailure = Date.now() - circuitBreaker.lastFailure;
      if (timeSinceLastFailure < circuitBreaker.resetTimeout) {
        console.log('🔴 useAuthState: Circuit breaker is open, skipping auth check');
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'Authentication service temporarily unavailable'
        }));
        return;
      } else {
        // Reset circuit breaker
        console.log('🟡 useAuthState: Resetting circuit breaker');
        circuitBreaker.isOpen = false;
        circuitBreaker.failures = 0;
      }
    }

    if (isCheckingRef.current) {
      console.log('🔄 useAuthState: Auth check already in progress, skipping attempt', attempt);
      return;
    }

    isCheckingRef.current = true;

    try {
      console.log(`🔍 useAuthState: Starting auth check (attempt ${attempt}/${maxAttempts})`);
      
      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      setAuthState(prev => ({ ...prev, attempts: attempt }));

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeout);
      });

      const fetchPromise = fetch('/api/auth/verify', {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache'
        },
        signal: abortControllerRef.current.signal
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ useAuthState: Auth check succeeded on attempt ${attempt}:`, data);

      // Reset circuit breaker on success
      circuitBreaker.failures = 0;
      circuitBreaker.isOpen = false;

      setAuthState({
        loading: false,
        authenticated: data.authenticated,
        error: data.error || null,
        attempts: attempt
      });

    } catch (error) {
      console.error(`❌ useAuthState: Auth check failed on attempt ${attempt}:`, error);
      
      // Handle abort errors gracefully
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🛑 useAuthState: Request was aborted');
        return;
      }

      // Update circuit breaker
      circuitBreaker.failures++;
      circuitBreaker.lastFailure = Date.now();
      
      if (circuitBreaker.failures >= maxAttempts) {
        console.warn('🔴 useAuthState: Opening circuit breaker due to repeated failures');
        circuitBreaker.isOpen = true;
      }

      if (attempt < maxAttempts && !circuitBreaker.isOpen) {
        const delay = retryDelay * attempt;
        console.log(`🔄 useAuthState: Retrying in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`);
        
        setTimeout(() => {
          if (!abortControllerRef.current?.signal.aborted) {
            checkAuth(attempt + 1);
          }
        }, delay);
      } else {
        console.warn('⚠️ useAuthState: Max attempts reached or circuit breaker open');
        setAuthState({
          loading: false,
          authenticated: false,
          error: error instanceof Error ? error.message : 'Authentication failed',
          attempts: attempt
        });
      }
    } finally {
      isCheckingRef.current = false;
    }
  }, [maxAttempts, retryDelay, timeout]);

  const retryAuth = useCallback(() => {
    console.log('🔄 useAuthState: Manual retry triggered');
    circuitBreakerRef.current.isOpen = false;
    circuitBreakerRef.current.failures = 0;
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    checkAuth(1);
  }, [checkAuth]);

  useEffect(() => {
    console.log('🚀 useAuthState: Hook initialized');
    console.log('🚀 useAuthState: expectAuthenticated =', expectAuthenticated);
    
    // Check for auth success cookie first
    const checkAuthCookie = () => {
      if (typeof window !== 'undefined') {
        const authSuccess = document.cookie.includes('auth-success=true');
        const userEmail = document.cookie.match(/user-email=([^;]+)/)?.[1];
        
        if (authSuccess && userEmail) {
          console.log('🍪 useAuthState: Found auth success cookie for', decodeURIComponent(userEmail));
          
          // Clear the temporary cookies
          document.cookie = 'auth-success=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'user-email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          
          return true;
        }
      }
      return false;
    };
    
    // Check URL for delay parameter
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const delayParam = urlParams?.get('delay');
    const customDelay = delayParam ? parseInt(delayParam, 10) : 0;
    
    let baseDelay = expectAuthenticated ? 1000 : 0;
    const totalDelay = Math.max(baseDelay, customDelay);
    
    console.log(`⏰ useAuthState: Starting auth check with ${totalDelay}ms delay (base: ${baseDelay}, custom: ${customDelay})`);
    
    // If we have auth success cookie, use shorter delay but still allow session to settle
    const effectiveDelay = checkAuthCookie() ? Math.min(totalDelay, 1500) : totalDelay;
    
    const timeoutId = setTimeout(() => {
      checkAuth(1);
    }, effectiveDelay);

    return () => {
      console.log('🧹 useAuthState: Cleaning up');
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      isCheckingRef.current = false;
    };
  }, [expectAuthenticated, checkAuth]);

  return {
    ...authState,
    retryAuth,
    isCircuitBreakerOpen: circuitBreakerRef.current.isOpen
  };
}
