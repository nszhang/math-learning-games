import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('🔍 Working callback triggered with URL:', request.url)
  
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  
  console.log('📋 Callback params:', { 
    code: code?.substring(0, 10) + '...', 
    next, 
    origin 
  })

  if (code) {
    console.log('🔑 Code received, attempting to exchange for session...')
    
    try {
      const supabase = await createClient()
      console.log('💾 Supabase client created successfully')
      
      // Exchange code for session with a timeout
      const { data, error } = await Promise.race([
        supabase.auth.exchangeCodeForSession(code),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session exchange timeout')), 10000)
        )
      ]) as any
      
      console.log('🔄 Code exchange completed')
      
      if (error) {
        console.error('❌ Error exchanging code for session:', error)
        return NextResponse.redirect(`${origin}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`)
      } 
      
      if (data.user) {
        console.log('✅ Successfully exchanged code for session:', { 
          user: data.user?.email, 
          hasSession: !!data.session 
        })
        
        // Create response with session persistence
        const redirectUrl = `${origin}/?fromAuth=true&delay=2000`
        const response = NextResponse.redirect(redirectUrl)
        
        // Set additional session indicators to help with timing
        if (data.session?.access_token) {
          // Set a temporary flag cookie that the client can check
          response.cookies.set('auth-success', 'true', {
            httpOnly: false, // Allow client-side access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 300 // 5 minutes
          })
          
          response.cookies.set('user-email', data.user.email || '', {
            httpOnly: false, // Allow client-side access
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 300 // 5 minutes
          })
        }
        
        // Wait longer for session to propagate
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        console.log('✨ Successful auth - redirecting to:', redirectUrl)
        return response
      } else {
        console.error('❌ Auth failed - no user data')
        return NextResponse.redirect(`${origin}/login?error=no_user`)
      }
      
    } catch (err) {
      console.error('💥 Session exchange exception:', err)
      return NextResponse.redirect(`${origin}/login?error=session_exchange_failed`)
    }
  } else {
    console.error('❌ No authorization code received in callback')
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }
}
