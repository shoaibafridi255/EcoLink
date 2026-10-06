import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span role="status" className={cn("inline-flex items-center justify-center", className)}>
      <Loader2 aria-hidden="true" className="h-5 w-5 shrink-0 animate-spin motion-reduce:animate-none" />
      <span className="sr-only">{label}</span>
    </span>
  );
}