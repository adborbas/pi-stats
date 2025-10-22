"use client";

import { useMemo, useState } from "react";
import { CardShell } from "@/components/ui/CardShell";
import { StatRow } from "@/components/ui/StatRow";
import { Collapsible } from "@/components/ui/Collapsible";
import { IfaceRow } from "@/components/rows/IfaceRow";
import { CardLoading, CardError } from "@/components/ui/CardState";
import { ShowMoreButton } from "@/components/ui/ShowMoreButton";
import { useNetwork } from "@/hooks/useCardData";

type IfInfo = { name: string; mac: string; ipv4: string | null; ipv6: string | null };
type Rate = { name: string; rxMbps: number; txMbps: number };
type MergedIface = IfInfo & { rxMbps: number; txMbps: number; isPrimary: boolean };

function compactRate(rx: number, tx: number): string {
  const fmt = (v: number) => {
    if (!Number.isFinite(v) || v < 0.005) return "—";
    return v >= 10 ? v.toFixed(1) : v.toFixed(2);
  };
  return `${fmt(rx)} ↓ / ${fmt(tx)} ↑ Mbps`;
}

function isVirtualName(name: string): boolean {
  return /^(docker0|veth|br-|lo|tailscale|tun|wg)/.test(name);
}

function pickPrimaryName(defaultIface: string | null, ifaces: IfInfo[], rates: Rate[]): string | null {
  const active = rates.find(r => (r.rxMbps ?? 0) > 0 || (r.txMbps ?? 0) > 0)?.name ?? null;
  const withIPv4 = ifaces.find(i => i.ipv4)?.name ?? null;
  return defaultIface || active || withIPv4 || ifaces[0]?.name || null;
}

function mergeIfaces(ifaces: IfInfo[], rates: Rate[], primaryName: string | null): MergedIface[] {
  return ifaces.map(iface => {
    const r = rates.find(n => n.name === iface.name);
    return {
      ...iface,
      rxMbps: r?.rxMbps ?? 0,
      txMbps: r?.txMbps ?? 0,
      isPrimary: primaryName ? iface.name === primaryName : false,
    };
  });
}

function totalsFrom(rates: Rate[]) {
  return rates.reduce(
    (acc, n) => ({ rx: acc.rx + (n.rxMbps || 0), tx: acc.tx + (n.txMbps || 0) }),
    { rx: 0, tx: 0 }
  );
}

function partitionIfaces(list: MergedIface[]) {
  const physical: MergedIface[] = [];
  const virtuals: MergedIface[] = [];
  for (const i of list) {
    if (i.isPrimary) continue;
    (isVirtualName(i.name) ? virtuals : physical).push(i);
  }
  const byActivity = (a: MergedIface, b: MergedIface) => (b.rxMbps + b.txMbps) - (a.rxMbps + a.txMbps);
  physical.sort(byActivity);
  virtuals.sort(byActivity);
  return { physical, virtuals };
}

export default function NetworkCard() {
  const { data, error } = useNetwork(2000);
  const [expanded, setExpanded] = useState(false);
  const [showVirtual, setShowVirtual] = useState(false);

  const isLoading = !data && !error;
  const isError = !!error;

  const snapshot = useMemo(() => {
    const rates: Rate[] = Array.isArray(data?.rates) ? (data!.rates as Rate[]) : [];
    const ifaces: IfInfo[] = Array.isArray(data?.ifaces) ? (data!.ifaces as IfInfo[]) : [];
    const defaultIface: string | null = data?.defaultIface ?? null;

    const primaryName = pickPrimaryName(defaultIface, ifaces, rates);
    const merged = mergeIfaces(ifaces, rates, primaryName);
    const totals = totalsFrom(rates);

    const primary =
      primaryName != null
        ? merged.find(i => i.name === primaryName) ??
        ({
          name: primaryName,
          mac: "",
          ipv4: null,
          ipv6: null,
          rxMbps: rates.find(r => r.name === primaryName)?.rxMbps ?? 0,
          txMbps: rates.find(r => r.name === primaryName)?.txMbps ?? 0,
          isPrimary: true,
        } as MergedIface)
        : null;

    const { physical, virtuals } = partitionIfaces(merged);

    return { totals, primary, physical, virtuals };
  }, [data]);

  return (
    <CardShell
      title="Network"
      actions={<ShowMoreButton expanded={expanded} onToggle={() => setExpanded(v => !v)} />}
    >
      {isError && <CardError title="Network" />}
      {isLoading && <CardLoading title="Network" />}

      {!isError && !isLoading && (
        <>
          <StatRow label="Total throughput" value={compactRate(snapshot.totals.rx, snapshot.totals.tx)} />

          {snapshot.primary ? (
            <IfaceRow
              name={snapshot.primary.name}
              ipv4={snapshot.primary.ipv4}
              ipv6={snapshot.primary.ipv6}
              mac={snapshot.primary.mac}
              rxMbps={snapshot.primary.rxMbps}
              txMbps={snapshot.primary.txMbps}
              isPrimary
            />
          ) : (
            <div className="text-sm text-muted-foreground">Detecting interfaces…</div>
          )}

          <Collapsible expanded={expanded} summary={<div className="text-sm font-semibold">Interfaces</div>}>
            <div className="space-y-2">
              {snapshot.physical.map(i => (
                <IfaceRow
                  key={i.name}
                  name={i.name}
                  ipv4={i.ipv4}
                  ipv6={i.ipv6}
                  mac={i.mac}
                  rxMbps={i.rxMbps}
                  txMbps={i.txMbps}
                />
              ))}

              {snapshot.virtuals.length > 0 && (
                <Collapsible
                  expanded={showVirtual}
                  summary={
                    <button
                      type="button"
                      className="text-sm font-semibold text-left"
                      onClick={() => setShowVirtual(v => !v)}
                    >
                      Virtual interfaces ({snapshot.virtuals.length})
                    </button>
                  }
                >
                  <div className="space-y-2">
                    {snapshot.virtuals.map(i => (
                      <IfaceRow
                        key={i.name}
                        name={i.name}
                        ipv4={i.ipv4}
                        ipv6={i.ipv6}
                        mac={i.mac}
                        rxMbps={i.rxMbps}
                        txMbps={i.txMbps}
                      />
                    ))}
                  </div>
                </Collapsible>
              )}
            </div>
          </Collapsible>
        </>
      )}
    </CardShell>
  );
}