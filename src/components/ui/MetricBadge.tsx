"use client";
import type { Tone } from "@/utils/tone";
import { toneClass } from "@/utils/tone";

export type MetricBadgeProps = {
  value: string;
  tone?: Tone;
  className?: string;
};

export function MetricBadge({ value, tone = "neutral", className }: MetricBadgeProps) {
  return <span className={`${toneClass(tone)} font-medium tabular-nums ${className ?? ""}`}>{value}</span>;
}