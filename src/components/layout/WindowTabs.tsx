'use client';

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { name: "할일 관리", href: "/" },
  { name: "주간 회고", href: "/retrospect" },
];

export function WindowTabs() {
  const pathname = usePathname();

  return (
    <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex-1 py-4 text-center text-sm font-medium border-b-[3px] transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
              isActive
                ? "bg-white dark:bg-gray-900 border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            )}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}

