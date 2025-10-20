"use client";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useMeasureHeight } from "@/hooks/useMeasureHeight";

export type CollapsibleProps = {
  expanded: boolean;
  summary: ReactNode;
  children: ReactNode;
  animate?: boolean;
  className?: string;
};

export function Collapsible({ expanded, summary, children, animate = true, className }: CollapsibleProps) {
  const { ref, maxHeight, recompute } = useMeasureHeight<HTMLDivElement>();
  useEffect(() => { recompute(); }, [children, expanded, recompute]);

  return (
    <div className={className}>
      <div
        className={`overflow-hidden ${animate ? "transition-[max-height] duration-300 ease-in-out" : ""}`}
        style={{ maxHeight: expanded ? maxHeight : 0 }}
      >
        <div className="flex items-center justify-between mt-2 mb-2">{summary}</div>
        <div ref={ref} className="mt-2">
         {children}
        </div>
      </div>
    </div>
  );
}