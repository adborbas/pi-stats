"use client";

import { useMemo } from "react";
import { CardShell } from "@/components/ui/CardShell";
import { StatList } from "@/components/ui/StatList";
import { StatRow } from "@/components/ui/StatRow";
import { CardLoading, CardError } from "@/components/ui/CardState";
import { useGeneral } from "@/hooks/useCardData";

function formatUptime(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function GeneralCard() {
  const { data, error } = useGeneral(30_000);

  const snapshot = useMemo(() => {
    if (!data) return null;
    return {
      hostname: data.os.hostname,
      platform: `${data.os.platform} - ${data.os.arch}`,
      uptimeText: formatUptime(Number(data.uptimeSec ?? 0)),
    };
  }, [data]);

  if (error) return <CardError title="General" />;
  if (!snapshot) return <CardLoading title="General" />;

  return (
    <CardShell title="General">
      <StatList>
        <StatRow label="Hostname" value={snapshot.hostname} />
        <StatRow label="Platform" value={snapshot.platform} />
        <StatRow label="Uptime" value={snapshot.uptimeText} />
      </StatList>
    </CardShell>
  );
}