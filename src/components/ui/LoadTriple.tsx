"use client";

import { MetricBadge } from "./MetricBadge";
import { toneForLoadPct } from "@/utils/health";

export type LoadTripleProps = {
  abs: [number, number, number];    // [1m, 5m, 15m]
  pct: [number, number, number];    // normalized % for each period
  className?: string;
};

export function LoadTriple({ abs, pct, className }: LoadTripleProps) {
  const [l1, l5, l15] = abs;
  const [p1, p5, p15] = pct;

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Load (1m/5m/15m)</span>
        <span className="font-medium text-right">
          <span className="text-foreground">
            {l1}/{l5}/{l15}
          </span>
          {"  ·  "}
          <MetricBadge value={`${p1.toFixed(0)}%`} tone={toneForLoadPct(p1)} />
          {" / "}
          <MetricBadge value={`${p5.toFixed(0)}%`} tone={toneForLoadPct(p5)} />
          {" / "}
          <MetricBadge value={`${p15.toFixed(0)}%`} tone={toneForLoadPct(p15)} />
        </span>
      </div>
    </div>
  );
}