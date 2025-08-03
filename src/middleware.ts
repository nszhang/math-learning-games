import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Temporarily disabled for testing
  console.log('🚫 Middleware disabled for testing - allowing all requests through')
  return
  // return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
'/((?!_next/static|_next/image|favicon.ico|auth/success|test-session-debug|test-auth-success|test-simple|test-minimal|test-auth|test-simple-auth|test-react-only|test-improved-auth|test-server-auth|test-minimal-auth|test-direct-auth|debug-simple|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
