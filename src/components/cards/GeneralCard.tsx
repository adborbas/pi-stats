"use client";

import { CardShell } from "@/components/ui/CardShell";
import { StatList } from "@/components/ui/StatList";
import { StatRow } from "@/components/ui/StatRow";
import { CardLoading, CardError } from "@/components/ui/CardState";
import { useGeneral } from "@/hooks/useCardData";

export default function GeneralCard() {
  const { data, error } = useGeneral(1000);

  if (error) return <CardError title="General" />;
  if (!data) return <CardLoading title="General" />;

  const secs = Number(data.uptimeSec ?? 0);
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);

  return (
    <CardShell title="General">
      <StatList>
        <StatRow label="Hostname" value={data.os.hostname} />
        <StatRow label="Platform" value={`${data.os.platform} - ${data.os.arch}`} />
        <StatRow label="Uptime" value={`${h}h ${m}m`} />
      </StatList>
    </CardShell>
  );
}