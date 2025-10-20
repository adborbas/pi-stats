import { thresholds } from "@/design/tokens";
import { toneForPercent } from "@/utils/tone";

export function toneForLoadPct(p: number)   { return toneForPercent(p, thresholds.loadPct); }
export function toneForDiskPct(p: number)   { return toneForPercent(p, thresholds.diskPct); }
export function toneForMemPct(p: number)    { return toneForPercent(p, thresholds.memPct); }
export function toneForTempC(c: number) {
  const { warn, bad } = thresholds.tempC;
  return c > bad ? "bad" : c >= warn ? "warn" : "good";
}