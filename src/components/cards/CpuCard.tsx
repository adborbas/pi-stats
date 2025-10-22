"use client";

import { useMemo, useState } from "react";
import { CardShell } from "@/components/ui/CardShell";
import { StatList } from "@/components/ui/StatList";
import { StatRow } from "@/components/ui/StatRow";
import { LoadTriple } from "@/components/ui/LoadTriple";
import { Progress } from "@/components/ui/progress";
import { CardLoading, CardError } from "@/components/ui/CardState";
import { ShowMoreButton } from "@/components/ui/ShowMoreButton";
import { Collapsible } from "@/components/ui/Collapsible";
import { useCpu } from "@/hooks/useCardData";
import type { CpuInfo } from "@/services/cpu/contract";

function fmtFan(info: Pick<CpuInfo, "fanRpm" | "fanDutyPct">) {
  const rpm = Number(info.fanRpm);
  const duty = Number(info.fanDutyPct);
  if (Number.isFinite(rpm)) return `${Math.round(rpm)} RPM`;
  if (Number.isFinite(duty)) return `${Math.round(duty)}% duty`;
  return "n/a";
}

export default function CpuCard() {
  const { data, error } = useCpu(1000);
  const [expanded, setExpanded] = useState(false);

  const snapshot = useMemo(() => {
    if (!data) return null;
    const pctTriple: [number, number, number] = [
      Math.min(100, (data.load.l1 / data.load.cpus) * 100),
      Math.min(100, (data.load.l5 / data.load.cpus) * 100),
      Math.min(100, (data.load.l15 / data.load.cpus) * 100),
    ];
    return {
      totalPct: data.totalPct,
      pctTriple,
      tempText: data.tempC == null ? "n/a" : `${data.tempC.toFixed(1)}°C`,
      fanText: fmtFan(data),
      perCore: data.perCorePct,
      topCpu: data.topCpu,
    };
  }, [data]);

  if (error) return <CardError title="CPU" />;
  if (!snapshot) return <CardLoading title="CPU" />;

  return (
    <CardShell title="CPU" actions={<ShowMoreButton expanded={expanded} onToggle={() => setExpanded(v => !v)} />}>
      <StatList>
        <StatRow label="Total" value={<span className="tabular-nums">{snapshot.totalPct.toFixed(1)}%</span>} />
      </StatList>

      <div className="mt-3">
        <LoadTriple pct={snapshot.pctTriple} />
      </div>

      <div className="mt-3">
        <StatList>
          <StatRow label="CPU Temp" value={<span className="inline-flex items-center gap-2">{snapshot.tempText}</span>} />
          <StatRow label="Fan" value={snapshot.fanText} />
        </StatList>
      </div>

      <div className="mt-3 space-y-2">
        {snapshot.perCore.map((v: number, i: number) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Core {i}</span>
              <span className="tabular-nums">{v.toFixed(1)}%</span>
            </div>
            <Progress value={v} className="h-2" />
          </div>
        ))}
      </div>

      <Collapsible expanded={expanded} summary={<div className="text-sm font-semibold">Top processes</div>}>
        <ul className="space-y-1 mt-2">
          {snapshot.topCpu.slice(0, 10).map((p: CpuInfo["topCpu"][number]) => (
            <li key={p.pid} className="flex justify-between text-xs text-muted-foreground">
              <span className="truncate max-w-[60%]">
                {p.cmd} <span className="opacity-70">({p.pid})</span>
              </span>
              <span className="tabular-nums">{p.cpuPct.toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      </Collapsible>
    </CardShell>
  );
}