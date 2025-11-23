'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { RotateCcw } from 'lucide-react';

export function Header() {
  const handleReset = () => {
    if (confirm('정말로 모든 데이터를 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      // TODO: Implement server-side reset or clear local storage/cookies if needed
      // For now, we just reload as we don't have a global reset API endpoint yet
      // resetState(); 
      localStorage.removeItem('grow-week-storage'); // Clear old local storage if any
      window.location.reload();
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
            onClick={handleReset}
            className="text-gray-500 hover:text-red-500"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            초기화
          </Button>

          {/* User profile or settings placeholder */}
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </header>
  );
}
