'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LogOut } from 'lucide-react';
import { logout } from '@/features/auth/api';

export function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      try {
        await logout();
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        localStorage.removeItem('accessToken');
        router.push('/login');
      }
    }
  };

  return (
    <header className="border-b bg-background sticky top-0 z-50 w-full">
      <div className="w-full h-14 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="font-bold text-lg">
            GrowWeek
          </Link>
        </div>
        
        {/* Center area - currently empty */}
        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-500"
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>

          {/* User profile or settings placeholder */}
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </header>
  );
}
