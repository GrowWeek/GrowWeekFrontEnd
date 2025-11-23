import Link from 'next/link';

export function Header() {
  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bold text-lg">
            GrowWeek
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              할일
            </Link>
            <Link href="/retrospect" className="hover:text-foreground transition-colors">
              회고
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {/* User profile or settings placeholder */}
          <div className="w-8 h-8 rounded-full bg-slate-200" />
        </div>
      </div>
    </header>
  );
}

