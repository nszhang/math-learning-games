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
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`
      } else {
        redirectUrl = `${origin}${next}`
      }
      
      console.log('✨ Using client-side redirect to:', redirectUrl)
      
      // Return HTML page with JavaScript redirect to avoid middleware conflicts
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Redirecting...</title>
            <script>
              console.log('Auth successful, redirecting to: ${redirectUrl}');
              window.location.href = '${redirectUrl}';
            </script>
          </head>
          <body>
            <p>Authentication successful! Redirecting...</p>
            <script>
              // Fallback in case the first redirect doesn't work
              setTimeout(() => {
                window.location.replace('${redirectUrl}');
              }, 1000);
            </script>
          </body>
        </html>
      `, {
        headers: {
          'Content-Type': 'text/html',
        },
      })
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
