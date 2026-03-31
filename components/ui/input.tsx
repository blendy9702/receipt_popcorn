import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-full border border-[#4e342e]/15 bg-white/85 px-4 text-sm text-[#4e342e] shadow-sm transition-colors placeholder:text-[#4e342e]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4e342e]/15 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
