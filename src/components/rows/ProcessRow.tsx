"use client";
import type { ReactNode } from "react";
import { format } from "@/utils/format";

export type ProcessRowProps = {
  pid: number | string;
  name: string;
  rssMB?: number | null;
  memPct?: number | null;
  right?: ReactNode;
};

export function ProcessRow({ pid, name, rssMB, memPct, right }: ProcessRowProps) {
  return (
    <div className="flex justify-between text-xs text-muted-foreground">
      <span className="truncate max-w-[60%]">
        {name} <span className="opacity-70">({pid})</span>
      </span>
      <span className="tabular-nums">
        {format.mb(rssMB ?? NaN)} · {format.pct(memPct ?? NaN, 1)} {right}
      </span>
    </div>
  );
}