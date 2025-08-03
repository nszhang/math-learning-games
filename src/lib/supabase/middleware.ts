import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  console.log('🔄 Middleware: Session update triggered');
  console.log('🔄 Middleware: Request cookies:', request.cookies.getAll());
  
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) = {
            console.log('🍪 Middleware: Setting cookie:', { name, value, options });
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: user, error } = await supabase.auth.getUser();

  if (error) {
    console.error('❌ Middleware: Error getting user:', error);
  } else {
    console.log('✅ Middleware: User retrieved:', user);
  }

  return supabaseResponse
}
