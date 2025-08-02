'use client';

import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const { user, loading, signOut } = useUser();

  if (loading) {
    return (
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Math Games</h1>
          <div className="animate-pulse bg-gray-300 h-9 w-20 rounded"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Math Games</h1>
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="text-sm">
                {user.user_metadata?.full_name || user.email}
              </span>
            </div>
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Welcome! Please sign in to save your progress.
          </div>
        )}
      </div>
    </header>
  );
}
