export type Tone = "good" | "warn" | "bad" | "neutral";

export function toneForPercent(p: number, thresholds = { warn: 70, bad: 90 }): Tone {
  if (!Number.isFinite(p)) return "neutral";
  if (p > thresholds.bad) return "bad";
  if (p >= thresholds.warn) return "warn";
  return "good";
}

export function toneClass(t: Tone): string {
  switch (t) {
    case "good": return "text-green-500";
    case "warn": return "text-orange-500";
    case "bad": return "text-red-500";
    default: return "text-foreground";
  }
}