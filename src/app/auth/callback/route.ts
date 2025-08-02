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
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('❌ Error exchanging code for session:', error)
    } else {
      console.log('✅ Successfully exchanged code for session:', { user: data.user?.email })
    }
    
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      console.log('🔍 Redirect environment check:', { 
        isLocalEnv, 
        forwardedHost, 
        origin, 
        next,
        nodeEnv: process.env.NODE_ENV 
      })
      
      let redirectUrl: string
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        redirectUrl = `${origin}${next}`
        console.log('🏠 Local environment redirect:', redirectUrl)
        return NextResponse.redirect(redirectUrl)
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`
        console.log('🌐 Forwarded host redirect:', redirectUrl)
        return NextResponse.redirect(redirectUrl)
      } else {
        redirectUrl = `${origin}${next}`
        console.log('🌍 Origin redirect:', redirectUrl)
        return NextResponse.redirect(redirectUrl)
      }
    }
  } else {
    console.error('❌ No authorization code received in callback')
  }

  // return the user to an error page with instructions
  console.log('🔄 Redirecting to error page')
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
