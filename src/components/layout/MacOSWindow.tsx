'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

interface MacOSWindowProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function MacOSWindow({ children, className, ...props }: MacOSWindowProps) {
  return (
    <div 
      className={cn(
        "flex flex-col bg-white dark:bg-gray-900 relative h-full",
        className
      )}
      {...props}
    >
      {/* Content */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}
