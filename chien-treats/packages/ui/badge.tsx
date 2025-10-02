import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-pink/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pink",
        className,
      )}
      {...props}
    />
  );
}
