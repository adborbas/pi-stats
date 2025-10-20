"use client";
import { Progress } from "@/components/ui/progress";
import { StatRow } from "./StatRow";

export type ProgressStatProps = {
  label: string;
  used: number;
  total: number;
  unit?: string;
  valuePercent: number;
};

export function ProgressStat({ label, used, total, unit = "GB", valuePercent }: ProgressStatProps) {
  return (
    <div className="space-y-1.5">
      <StatRow
        label={label}
        value={`${used.toFixed(2)} / ${total.toFixed(2)} ${unit}`}
      />
      <Progress value={valuePercent} className="h-2" />
    </div>
  );
}