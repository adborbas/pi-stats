"use client";
import { Progress } from "@/components/ui/progress";

export type DiskRowProps = {
  mount: string;
  fs: string;
  usedGB: number;
  sizeGB: number;
  usedPct: number;
};

export function DiskRow({ mount, fs, usedGB, sizeGB, usedPct }: DiskRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{mount} ({fs})</span>
        <span className="text-foreground font-medium">{usedGB} / {sizeGB} GB</span>
      </div>
      <Progress value={usedPct} className="h-2" />
    </div>
  );
}