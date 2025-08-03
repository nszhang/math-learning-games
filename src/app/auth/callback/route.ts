import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('🔍 Auth callback triggered with URL:', request.url)
  
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  
  console.log('📋 Callback params:', { code: code?.substring(0, 10) + '...', next, origin })

  if (code) {
    console.log('🔑 Code received, attempting to exchange for session...')
    try {
      const supabase = await createClient()
      console.log('💾 Supabase client created successfully')
      
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      console.log('🔄 Code exchange completed')
      
      if (error) {
        console.error('❌ Error exchanging code for session:', error)
      } else {
      console.log('✅ Successfully exchanged code for session:', { user: data.user?.email, hasSession: !!data.session })
      }
      
      if (!error && data.user) {
        const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
        const isLocalEnv = process.env.NODE_ENV === 'development'
        
        console.log('🔍 Redirect environment check:', { 
          isLocalEnv, 
          forwardedHost, 
          origin, 
          next,
          nodeEnv: process.env.NODE_ENV,
          hasUser: !!data.user,
          userEmail: data.user?.email
        })
        
        // Redirect through the auth success page to ensure session is ready
        let redirectUrl: string
        const successPagePath = `/auth/success?next=${encodeURIComponent(next)}`
        
        if (isLocalEnv) {
          redirectUrl = `${origin}${successPagePath}`
        } else if (forwardedHost) {
          redirectUrl = `https://${forwardedHost}${successPagePath}`
        } else {
          redirectUrl = `${origin}${successPagePath}`
        }
        
        console.log('✨ Successful auth - redirecting through success page to:', redirectUrl)
        console.log('🎯 Final destination will be:', next)
        return NextResponse.redirect(redirectUrl)
      } else {
        console.error('❌ Auth failed - no user data or error occurred:', { error: error?.message, hasUser: !!data?.user })
      }
    } catch (err) {
      console.error('💥 Exception in code exchange:', err)
    }
  } else {
    console.error('❌ No authorization code received in callback')
  }

  // return the user to an error page with instructions
  console.log('🔄 Redirecting to error page')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
