"use client";

import { CardShell } from "@/components/ui/CardShell";
import { DiskRow } from "@/components/rows/DiskRow";
import { StatRow } from "@/components/ui/StatRow";
import { CardLoading, CardError } from "@/components/ui/CardState";
import { useStorage } from "@/hooks/useCardData";
import type { StorageInfo } from "@/services/storage/contract";

export default function StorageCard() {
  const { data, error } = useStorage();

  if (error) return <CardError title="Storage" />;
  if (!data) return <CardLoading title="Storage" />;

  return (
    <CardShell title="Storage">
      <div className="space-y-3">
        {data.disks.map((d: StorageInfo["disks"][number]) => (
          <DiskRow
            key={`${d.mount}-${d.fs}`}
            mount={d.mount}
            fs={d.fs}
            usedGB={d.usedGB}
            sizeGB={d.sizeGB}
            usedPct={d.usedPct}
          />
        ))}
      </div>

      <StatRow
        label="Swap"
        value={`${data.swap.usedMB} / ${data.swap.totalMB} MB (${data.swap.usedPct}%)`}
      />
    </CardShell>
  );
}