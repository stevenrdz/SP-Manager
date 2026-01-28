
import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "destructive" | "outline";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "border-transparent bg-brand-500 text-white hover:bg-brand-600",
    secondary: "border-transparent bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200",
    destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
    outline: "border border-gray-200 text-gray-700 dark:border-white/10 dark:text-gray-200"
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:ring-offset-0",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge"

export { Badge }
