"use client";
import type { ReactNode } from "react";

export type StatRowProps = {
  label: ReactNode;
  value: ReactNode;
  size?: "sm" | "md";
  dimLabel?: boolean;
  monoValue?: boolean;
  className?: string;
};

export function StatRow({ label, value, size = "sm", dimLabel = true, monoValue = false, className }: StatRowProps) {
  const sizeCls = size === "sm" ? "text-sm" : "text-base";
  return (
    <div className={`flex justify-between ${sizeCls} ${className ?? ""}`}>
      <span className={dimLabel ? "text-muted-foreground" : ""}>{label}</span>
      <span className={`${monoValue ? "tabular-nums" : ""} font-medium text-right`}>{value}</span>
    </div>
  );
}