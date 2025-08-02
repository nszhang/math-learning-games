'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { UnifiedGameStatsService } from '@/lib/database';

interface UserContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasMigrated, setHasMigrated] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      // If user is signed in and we haven't migrated yet, migrate local data
      if (session?.user && !hasMigrated) {
        try {
          await UnifiedGameStatsService.migrateLocalDataToSupabase(session.user);
          setHasMigrated(true);
        } catch (error) {
          console.error('Error during data migration:', error);
        }
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const newUser = session?.user ?? null;
        setUser(newUser);
        
        // If user just signed in and we haven't migrated yet, migrate local data
        if (event === 'SIGNED_IN' && newUser && !hasMigrated) {
          try {
            await UnifiedGameStatsService.migrateLocalDataToSupabase(newUser);
            setHasMigrated(true);
          } catch (error) {
            console.error('Error during sign-in data migration:', error);
          }
        }
        
        // Reset migration flag when user signs out
        if (event === 'SIGNED_OUT') {
          setHasMigrated(false);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth, hasMigrated]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setHasMigrated(false);
  };

  return (
    <UserContext.Provider value={{ user, loading, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
