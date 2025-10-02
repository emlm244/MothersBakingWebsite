import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, type = "text", ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-12 w-full rounded-2xl border border-brown/20 bg-white px-4 text-brown shadow-soft transition placeholder:text-brown/40 focus-visible:border-pink focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
});
