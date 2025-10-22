"use client";

import { useMemo } from "react";
import { CardShell } from "@/components/ui/CardShell";
import { DiskRow } from "@/components/rows/DiskRow";
import { StatRow } from "@/components/ui/StatRow";
import { CardLoading, CardError } from "@/components/ui/CardState";
import { useStorage } from "@/hooks/useCardData";
import type { StorageInfo } from "@/services/storage/contract";
import { ListStack } from "@/components/ui/ListStack";

export default function StorageCard() {
  const { data, error } = useStorage();

  const snapshot = useMemo(() => {
    if (!data) return null;
    return {
      disks: data.disks as StorageInfo["disks"],
      swap: data.swap,
    };
  }, [data]);

  if (error) return <CardError title="Storage" />;
  if (!snapshot) return <CardLoading title="Storage" />;

  return (
    <CardShell title="Storage">
      <ListStack gap="md">
        {snapshot.disks.map((d) => (
          <DiskRow
            key={`${d.mount}-${d.fs}`}
            mount={d.mount}
            fs={d.fs}
            usedGB={d.usedGB}
            sizeGB={d.sizeGB}
            usedPct={d.usedPct}
          />
        ))}
      </ListStack>

      <StatRow
        label="Swap"
        value={`${snapshot.swap.usedMB} / ${snapshot.swap.totalMB} MB (${snapshot.swap.usedPct}%)`}
      />
    </CardShell>
  );
}