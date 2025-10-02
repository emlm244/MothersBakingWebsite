import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[120px] w-full rounded-2xl border border-brown/20 bg-white px-4 py-3 text-brown shadow-soft transition placeholder:text-brown/40 focus-visible:border-pink focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
});
