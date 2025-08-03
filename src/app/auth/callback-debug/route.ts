import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  console.log('🔥 DEBUG CALLBACK TRIGGERED')
  console.log('🔥 Request URL:', request.url)
  
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const origin = url.origin
  
  console.log('🔥 Parameters:', {
    code: code ? 'YES' : 'NO',
    error: error || 'NONE',
    origin,
    searchParams: Object.fromEntries(url.searchParams)
  })
  
  // Don't do ANY Supabase operations - just redirect to a test page
  const redirectUrl = `${origin}/debug-simple?callback=success&hasCode=${!!code}&hasError=${!!error}`
  
  console.log('🔥 Redirecting to:', redirectUrl)
  
  return NextResponse.redirect(redirectUrl)
}
