"use client";

import { useMemo, useState } from "react";
import { CardShell } from "@/components/ui/CardShell";
import { ProgressStat } from "@/components/ui/ProgressStat";
import { Collapsible } from "@/components/ui/Collapsible";
import { ShowMoreButton } from "@/components/ui/ShowMoreButton";
import { CardLoading, CardError } from "@/components/ui/CardState";
import { useMemory } from "@/hooks/useCardData";
import type { TopProc } from "@/lib/system/types";
import { Section } from "@/components/ui/Section";
import { ProcessList } from "@/components/rows/ProcessList";
import { SummaryTitle } from "@/components/ui/SummaryTitle";

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
        <Section>
          <Collapsible expanded={expanded} summary={<SummaryTitle text="Top processes" />}>
            <ProcessList items={snapshot.visible} />
          </Collapsible>
        </Section>
      )}
    </CardShell>
  );
}