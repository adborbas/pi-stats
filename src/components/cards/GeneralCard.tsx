"use client";

import { CardShell } from "@/components/ui/CardShell";
import { StatList } from "@/components/ui/StatList";
import { StatRow } from "@/components/ui/StatRow";
import { LoadTriple } from "@/components/ui/LoadTriple";
import { CardLoading, CardError } from "@/components/ui/CardState";
import { StatusDot } from "@/components/ui/StatusDot";
import { toneForTempC } from "@/utils/health";
import { useGeneral } from "@/hooks/useCardData";

export default function GeneralCard() {
  const { data, error } = useGeneral(1000);

  if (error) return <CardError title="General" />;
  if (!data) return <CardLoading title="General" />;

  const secs = Number(data.uptimeSec ?? 0);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);

  const l1 = Number(data.load.l1 ?? 0);
  const l5 = Number(data.load.l5 ?? 0);
  const l15 = Number(data.load.l15 ?? 0);
  const cpus = Number(data.load.cpus ?? 1);
  const pct = (v: number) => Math.max(0, Math.min(100, (v / Math.max(1, cpus)) * 100));

  const tempC = data.cpuTemp == null ? null : Number(data.cpuTemp);
  const tempText = tempC == null ? "n/a" : `${tempC.toFixed(1)}°C`;
  const tempTone = tempC == null ? "neutral" : toneForTempC(tempC);

  const fanRowText =
    data.fanRpm != null && Number.isFinite(Number(data.fanRpm))
      ? `${Math.round(Number(data.fanRpm))} RPM`
      : data.fanDutyPct != null && Number.isFinite(Number(data.fanDutyPct))
      ? `${Math.round(Number(data.fanDutyPct))}% duty`
      : null;

  return (
    <CardShell
      title="General"
    >
      <StatList>
        <StatRow label="Hostname" value={data.os.hostname} />
        <StatRow label="Platform" value={`${data.os.platform} - ${data.os.arch}`} />
        <StatRow label="Uptime" value={`${h}h ${m}m`}/>
        <StatRow
          label="CPU Temp"
          value={
            <span className="inline-flex items-center gap-2">
              <StatusDot tone={tempTone} title={`CPU temperature ${tempText}`} />
              <span>{tempText}</span>
            </span>
          }
        />
        {fanRowText && <StatRow label="Fan" value={fanRowText} />}
      </StatList>

      <LoadTriple abs={[l1, l5, l15]} pct={[pct(l1), pct(l5), pct(l15)]} />
    </CardShell>
  );
}