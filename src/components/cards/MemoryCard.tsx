"use client";

import { useMemo, useState } from "react";
import { CardShell } from "@/components/ui/CardShell";
import { ProgressStat } from "@/components/ui/ProgressStat";
import { Collapsible } from "@/components/ui/Collapsible";
import { ShowMoreButton } from "@/components/ui/ShowMoreButton";
import { ProcessRow } from "@/components/rows/ProcessRow";
import { CardLoading, CardError } from "@/components/ui/CardState";
import { useMemory } from "@/hooks/useCardData";
import type { TopProc } from "@/lib/system/types";

function clamp(n: number, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, n)); }

export default function MemoryCard() {
  const { data, error } = useMemory(1000);
  const [expanded, setExpanded] = useState(false);

  const snapshot = useMemo(() => {
    if (!data) return null;
    const used = Number(data.usedGB);
    const total = Number(data.totalGB);
    const pct = clamp((used / (total || 1)) * 100);
    const top = Array.isArray(data.topProcs) ? (data.topProcs as TopProc[]) : [];
    return {
      used,
      total,
      pct,
      top,
      visible: top.slice(0, expanded ? 20 : 8),
      hasTop: top.length > 0,
    };
  }, [data, expanded]);

  if (error) return <CardError title="Memory" />;
  if (!snapshot) return <CardLoading title="Memory" />;

  return (
    <CardShell
      title="Memory"
      actions={snapshot.hasTop ? (
        <ShowMoreButton expanded={expanded} onToggle={() => setExpanded(v => !v)} />
      ) : null}
    >
      <ProgressStat label="Used" used={snapshot.used} total={snapshot.total} valuePercent={snapshot.pct} />

      {snapshot.hasTop && (
        <Collapsible expanded={expanded} summary={<div className="text-sm font-semibold">Top processes</div>}>
          <ul className="space-y-1">
            {snapshot.visible.map((p) => (
              <li key={p.pid}>
                <ProcessRow pid={p.pid} name={p.cmd} rssMB={Number(p.rssMB)} memPct={Number(p.memPct)} />
              </li>
            ))}
          </ul>
        </Collapsible>
      )}
    </CardShell>
  );
}