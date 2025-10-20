"use client";

import { useState } from "react";
import { CardShell } from "@/components/ui/CardShell";
import { ProgressStat } from "@/components/ui/ProgressStat";
import { Collapsible } from "@/components/ui/Collapsible";
import { ShowMoreButton } from "@/components/ui/ShowMoreButton";
import { ProcessRow } from "@/components/rows/ProcessRow";
import { CardLoading, CardError } from "@/components/ui/CardState";
import { useMemory } from "@/hooks/useCardData";
import type { TopProc } from "@/lib/system/types";

export default function MemoryCard() {
  const { data, error } = useMemory(1000);
  const [expanded, setExpanded] = useState(false);

  if (error) return <CardError title="Memory" />;
  if (!data) return <CardLoading title="Memory" />;

  const pct = (data.usedGB / data.totalGB) * 100;
  const top = Array.isArray(data.topProcs) ? (data.topProcs as TopProc[]) : [];
  const visible = top.slice(0, expanded ? 20 : 8);

  return (
    <CardShell
      title="Memory"
      actions={
        top.length > 0 ? (
          <ShowMoreButton expanded={expanded} onToggle={() => setExpanded((v) => !v)} />
        ) : null
      }
    >
      <ProgressStat label="Used" used={data.usedGB} total={data.totalGB} valuePercent={pct} />

      {top.length > 0 && (
        <Collapsible
          expanded={expanded}
          summary={<div className="text-sm font-semibold">Top processes</div>}
        >
          <ul className="space-y-1">
            {visible.map((p: TopProc) => (
              <li key={p.pid}>
                <ProcessRow
                  pid={p.pid}
                  name={p.cmd}
                  rssMB={Number(p.rssMB)}
                  memPct={Number(p.memPct)}
                />
              </li>
            ))}
          </ul>
        </Collapsible>
      )}
    </CardShell>
  );
}