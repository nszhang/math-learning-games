import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    console.log('🔍 Server: Verifying session...')
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.log('❌ Server: Session verification failed:', error.message)
      return NextResponse.json({ 
        authenticated: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
    
    if (user) {
      console.log('✅ Server: User verified:', user.email)
      return NextResponse.json({ 
        authenticated: true, 
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        timestamp: new Date().toISOString()
      })
    }
    
    console.log('⚠️ Server: No user found')
    return NextResponse.json({ 
      authenticated: false,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('💥 Server: Session verification exception:', error)
    return NextResponse.json({ 
      authenticated: false, 
      error: 'Server error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
