import * as React from "react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // Add support for Radix-like or custom boolean change handler if needed, 
  // but currently it's just a wrapper around native input.
  // However, user tried to use onCheckedChange which usually comes from Radix UI.
  // If we want to keep it simple native:
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={(e) => {
            onChange?.(e);
            onCheckedChange?.(e.target.checked);
        }}
        {...props}
      />
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
