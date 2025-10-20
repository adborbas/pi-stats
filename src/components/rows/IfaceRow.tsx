"use client";
import { format } from "@/utils/format";

export type IfaceRowProps = {
  name: string;
  ipv4?: string | null;
  ipv6?: string | null;
  mac?: string | null;
  rxMbps?: number;
  txMbps?: number;
  isPrimary?: boolean;
};

export function IfaceRow({ name, ipv4, ipv6, mac, rxMbps = 0, txMbps = 0, isPrimary = false }: IfaceRowProps) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          {name} {isPrimary && <span className="ml-1 text-sm text-foreground/70">(default)</span>}
        </span>
        <span className="font-medium">
          {format.mbps(rxMbps)} ↓ / {format.mbps(txMbps)} ↑
        </span>
      </div>
      <div className="space-x-2 justify-between text-sm text-muted-foreground mt-1">
        <span className="text-foreground">{ipv4 ?? "n/a"}</span>
        <span className="text-foreground">{mac || "n/a"}</span>
      </div>
      {ipv6 && (
        <div className="text-xs text-muted-foreground mt-1">
          <span className="text-foreground break-all">{ipv6}</span>
        </div>
      )}
    </div>
  );
}