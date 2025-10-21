"use client";

import { CardShell } from "@/components/ui/CardShell";
import { StatList } from "@/components/ui/StatList";
import { StatRow } from "@/components/ui/StatRow";
import { LoadTriple } from "@/components/ui/LoadTriple";
import { Progress } from "@/components/ui/progress";
import { CardLoading, CardError } from "@/components/ui/CardState";
import { StatusDot } from "@/components/ui/StatusDot";
import { toneForTempC } from "@/utils/health";
import { ShowMoreButton } from "@/components/ui/ShowMoreButton";
import { useState } from "react";
import { useCpu } from "@/hooks/useCardData";
import type { CpuInfo } from "@/services/cpu/contract";

export default function CpuCard() {
  const { data, error } = useCpu(1000);
  const [expanded, setExpanded] = useState(false);

  if (error) return <CardError title="CPU" />;
  if (!data) return <CardLoading title="CPU" />;

  const tempTone = data.tempC == null ? "neutral" : toneForTempC(data.tempC);

  const fanText =
    data.fanRpm != null && Number.isFinite(Number(data.fanRpm))
      ? `${Math.round(Number(data.fanRpm))} RPM`
      : data.fanDutyPct != null && Number.isFinite(Number(data.fanDutyPct))
      ? `${Math.round(Number(data.fanDutyPct))}% duty`
      : "n/a";

  return (
    <CardShell
      title="CPU"
      actions={<ShowMoreButton expanded={expanded} onToggle={() => setExpanded((v) => !v)} />}
    >
      <StatList>
        <StatRow
          label="Total"
          value={<span className="tabular-nums">{data.totalPct.toFixed(1)}%</span>}
        />
      </StatList>

      <div className="mt-3">
        <LoadTriple
          abs={[data.load.l1, data.load.l5, data.load.l15]}
          pct={[
            Math.min(100, (data.load.l1 / data.load.cpus) * 100),
            Math.min(100, (data.load.l5 / data.load.cpus) * 100),
            Math.min(100, (data.load.l15 / data.load.cpus) * 100),
          ]}
        />
      </div>

      <div className="mt-3">
        <StatList>
          <StatRow
            label="CPU Temp"
            value={
              <span className="inline-flex items-center gap-2">
                <StatusDot tone={tempTone} title={`CPU temperature`} />
                <span>{data.tempC == null ? "n/a" : `${data.tempC.toFixed(1)}°C`}</span>
              </span>
            }
          />
          <StatRow label="Fan" value={fanText} />
        </StatList>
      </div>

      <div className="mt-3 space-y-2">
        {data.perCorePct.map((v: number, i: number) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Core {i}</span>
              <span className="tabular-nums">{v.toFixed(1)}%</span>
            </div>
            <Progress value={v} className="h-2" />
          </div>
        ))}
      </div>

      {expanded && (
        <div className="mt-3">
          <div className="text-sm font-semibold mb-2">Top processes</div>
          <ul className="space-y-1">
            {data.topCpu.slice(0, 10).map((p: CpuInfo["topCpu"][number]) => (
              <li key={p.pid} className="flex justify-between text-xs text-muted-foreground">
                <span className="truncate max-w-[60%]">
                  {p.cmd} <span className="opacity-70">({p.pid})</span>
                </span>
                <span className="tabular-nums">{p.cpuPct.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </CardShell>
  );
}