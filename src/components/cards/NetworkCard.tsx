"use client";

import { useMemo, useState } from "react";
import { CardShell } from "@/components/ui/CardShell";
import { StatRow } from "@/components/ui/StatRow";
import { Collapsible } from "@/components/ui/Collapsible";
import { IfaceRow } from "@/components/rows/IfaceRow";
import { format } from "@/utils/format";
import { CardLoading, CardError } from "@/components/ui/CardState";
import { ShowMoreButton } from "@/components/ui/ShowMoreButton";
import { useNetwork } from "@/hooks/useCardData";

type IfInfo = { name: string; mac: string; ipv4: string | null; ipv6: string | null };
type Rate = { name: string; rxMbps: number; txMbps: number };

export default function NetworkCard() {
  // Top-level hooks must always run in the same order across renders
  const { data, error } = useNetwork(2000);
  const [expanded, setExpanded] = useState(false);

  // Derive stable values regardless of loading/error
  const rates = useMemo<Rate[]>(
    () => (Array.isArray(data?.rates) ? (data!.rates as Rate[]) : []),
    [data]
  );
  const ifaces = useMemo<IfInfo[]>(
    () => (Array.isArray(data?.ifaces) ? (data!.ifaces as IfInfo[]) : []),
    [data]
  );
  const defaultIface: string | null = data?.defaultIface ?? null;

  const primaryName = useMemo(() => {
    return (
      defaultIface ||
      rates.find((r) => (r.rxMbps ?? 0) > 0 || (r.txMbps ?? 0) > 0)?.name ||
      ifaces.find((i) => i.ipv4)?.name ||
      ifaces[0]?.name ||
      null
    );
  }, [defaultIface, rates, ifaces]);

  const primary = useMemo(() => {
    if (!primaryName) return null;
    const info = ifaces.find((i) => i.name === primaryName);
    const r = rates.find((n) => n.name === primaryName);
    return info
      ? { ...info, rxMbps: r?.rxMbps ?? 0, txMbps: r?.txMbps ?? 0 }
      : {
          name: primaryName,
          mac: "",
          ipv4: null,
          ipv6: null,
          rxMbps: r?.rxMbps ?? 0,
          txMbps: r?.txMbps ?? 0,
        };
  }, [primaryName, ifaces, rates]);

  const totals = useMemo(
    () =>
      rates.reduce(
        (acc, n) => ({ rx: acc.rx + (n.rxMbps || 0), tx: acc.tx + (n.txMbps || 0) }),
        { rx: 0, tx: 0 }
      ),
    [rates]
  );

  const merged = useMemo(() => {
    return ifaces.map((i) => {
      const r = rates.find((n) => n.name === i.name);
      return {
        ...i,
        rxMbps: r?.rxMbps ?? 0,
        txMbps: r?.txMbps ?? 0,
        isPrimary: primaryName ? i.name === primaryName : false,
      };
    });
  }, [ifaces, rates, primaryName]);

  const isLoading = !data && !error;
  const isError = !!error;

  return (
    <CardShell
      title="Network"
      actions={<ShowMoreButton expanded={expanded} onToggle={() => setExpanded((v) => !v)} />}
    >
      {isError && <CardError title="Network" />}
      {isLoading && <CardLoading title="Network" />}

      {!isError && !isLoading && (
        <>
          <StatRow
            label="Total throughput"
            value={`${format.mbps(totals.rx)} ↓ / ${format.mbps(totals.tx)} ↑`}
          />

          {primary ? (
            <div className="space-y-2">
              <IfaceRow
                name={primary.name}
                ipv4={primary.ipv4}
                mac={primary.mac}
                rxMbps={primary.rxMbps}
                txMbps={primary.txMbps}
                isPrimary
              />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Detecting interfaces…</div>
          )}

          <Collapsible expanded={expanded} summary={<div className="text-sm font-semibold">Interfaces</div>}>
            <div className="space-y-2">
              {merged.length === 0 && (
                <div className="text-sm text-muted-foreground">Collecting…</div>
              )}
              {merged
                .filter((i) => !i.isPrimary)
                .map((i: IfInfo & { rxMbps: number; txMbps: number; isPrimary: boolean }) => (
                  <IfaceRow
                    key={i.name}
                    name={i.name}
                    ipv4={i.ipv4}
                    ipv6={i.ipv6}
                    mac={i.mac}
                    rxMbps={i.rxMbps}
                    txMbps={i.txMbps}
                    isPrimary={i.isPrimary}
                  />
                ))}
            </div>
          </Collapsible>
        </>
      )}
    </CardShell>
  );
}
