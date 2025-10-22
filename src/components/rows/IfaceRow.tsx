"use client";
import { useState } from "react";

export type IfaceRowProps = {
  name: string;
  ipv4?: string | null;
  ipv6?: string | null;
  mac?: string | null;
  rxMbps?: number;
  txMbps?: number;
  isPrimary?: boolean;
};

function rateText(rx?: number, tx?: number) {
  const rxv = typeof rx === "number" ? rx : 0;
  const txv = typeof tx === "number" ? tx : 0;

  const fmt = (v: number) => {
    if (v < 0.005) return "—";
    const d = v >= 10 ? 1 : 2;
    return v.toFixed(d);
  };

  const rxStr = fmt(rxv);
  const txStr = fmt(txv);

  return (
    <span className="tabular-nums font-medium whitespace-nowrap text-right inline-block">
      {rxStr} ↓ / {txStr} ↑ Mbps
    </span>
  );
}

export function IfaceRow({ name, ipv4, ipv6, mac, rxMbps = 0, txMbps = 0, isPrimary = false }: IfaceRowProps) {
  const [showIPv6, setShowIPv6] = useState(false);

  return (
    <div className="rounded-md border border-border/50 p-2">
      <div className="flex items-start justify-between text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-foreground font-medium">{name}</span>
          {isPrimary && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-accent text-foreground/80">default</span>
          )}
        </div>
        <div className="shrink-0 overflow-hidden">{rateText(rxMbps, txMbps)}</div>
      </div>

      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="font-mono text-foreground truncate max-w-[12rem]">{ipv4 ?? "n/a"}</span>
          <span className="font-mono text-foreground truncate max-w-[12rem]">{mac || "n/a"}</span>
        </div>
        {ipv6 ? (
          <button
            type="button"
            className="text-[11px] underline underline-offset-2"
            onClick={() => setShowIPv6((v) => !v)}
          >
            IPv6 {showIPv6 ? "▴" : "▾"}
          </button>
        ) : null}
      </div>

      {ipv6 && showIPv6 && (
        <div className="mt-1 text-[11px] text-muted-foreground font-mono break-all">
          {ipv6}
        </div>
      )}
    </div>
  );
}