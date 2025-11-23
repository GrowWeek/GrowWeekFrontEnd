import Link from 'next/link';

export function Header() {
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

        <div className="flex items-center gap-2">
          {/* User profile or settings placeholder */}
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </header>
  );
}
