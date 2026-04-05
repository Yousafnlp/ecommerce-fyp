import * as React from "react";
import { cn } from "@/lib/utils";
function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // 1. Base Styles & Colors
        "flex h-9 w-full rounded-md px-3 py-1 text-sm shadow-sm transition-colors",
        "bg-input text-foreground placeholder:text-muted-foreground",
        
        // 2. The Border - Standardized to match Divs/Selects
        "border border-border", 
        
        // 3. Hover & Focus States
        "hover:border-border/80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring",
        
        // 4. File & Disabled States
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "disabled:cursor-not-allowed disabled:opacity-50",
        
        className
      )}
      {...props}
    />
  );
}
export { Input };