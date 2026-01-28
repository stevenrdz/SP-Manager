
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root
const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger ref={ref} className={cn("flex h-10 w-full min-w-0 items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-gray-900/70 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-brand-400/50", className)} {...props}>
    {children}
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Content>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content ref={ref} className={cn("relative z-50 max-h-[60vh] min-w-[8rem] overflow-hidden rounded-md border bg-white text-gray-900 shadow-md dark:bg-gray-900 dark:text-gray-100", className)} position={position} sideOffset={4} {...props}>
      <SelectPrimitive.Viewport className={cn("p-1 max-h-[60vh] w-full min-w-[var(--radix-select-trigger-width)] overflow-y-auto custom-scrollbar", position === "popper" && "w-full min-w-[var(--radix-select-trigger-width)]")}>
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = React.forwardRef<React.ElementRef<typeof SelectPrimitive.Item>, React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item ref={ref} className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-3 pr-2 text-left text-sm text-gray-900 outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:text-gray-100 dark:focus:bg-white/10", className)} {...props}>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
