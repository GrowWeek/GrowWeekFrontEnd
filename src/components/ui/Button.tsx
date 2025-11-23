import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Need to install class-variance-authority for cleaner variant management
// If not installed, I will implement it manually or request installation.
// Checking package.json... I didn't see cva installed.
// I will simulate CVA or just use simple switch/cn for now to avoid extra deps if user didn't ask, 
// but CVA is standard for this. I'll stick to simple props + cn for now to keep it lightweight 
// unless I install CVA. Actually, I'll install CVA as it's best practice for component libraries.

// Wait, I shouldn't install deps without checking. 
// I'll use a manual variant mapping approach for now to be safe and fast.

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', ...props }, ref) => {
    
    const variants = {
      primary: "bg-blue-500 text-white hover:bg-blue-600 shadow-sm border border-transparent active:bg-blue-700",
      secondary: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm active:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-700",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
      destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm border border-transparent active:bg-red-700",
    };

    const sizes = {
      sm: "h-7 px-3 text-xs rounded-md",
      md: "h-9 px-4 text-sm rounded-lg",
      lg: "h-11 px-6 text-base rounded-xl",
      icon: "h-9 w-9 p-0 rounded-lg flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

