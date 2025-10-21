import type { CpuService, CpuInfo } from "@/services/cpu/contract";

const start = Date.now();
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const rnd = (lo: number, hi: number) => lo + Math.random() * (hi - lo);

export const cpuService: CpuService = {
  async get(): Promise<CpuInfo> {
    const t = (Date.now() - start) / 1000;

    const cores = 4;
    const perCore = Array.from({ length: cores }, (_, i) =>
      Math.max(0, Math.min(100, Math.round(35 + 15 * Math.sin(t / 3 + i) + (Math.random() - 0.5) * 6)))) as number[];
    const total = Number((perCore.reduce((a, b) => a + b, 0) / cores).toFixed(1));

    const load = {
      l1: Number((0.5 + 0.2 * Math.sin(t / 30)).toFixed(2)),
      l5: Number((0.4 + 0.15 * Math.sin(t / 90)).toFixed(2)),
      l15: Number((0.3 + 0.1 * Math.sin(t / 300)).toFixed(2)),
      cpus: cores,
    };

    const tempC = Number((48 + 3 * Math.sin(t / 20) + (Math.random() - 0.5)).toFixed(1));
    const fanRpm = Math.round(1300 + 300 * Math.sin(t / 15) + rnd(-60, 60));
    const fanDutyPct = Math.round(clamp(50 + 20 * Math.sin(t / 18), 0, 100));

    const topCpu = Array.from({ length: 8 }, (_, i) => ({
      pid: 1000 + i,
      cmd: i === 0 ? "node" : i === 1 ? "next-server" : "worker",
      cpuPct: Number((rnd(1, 35) * Math.abs(Math.sin(t / 10 + i))).toFixed(1)),
    })).sort((a, b) => b.cpuPct - a.cpuPct);

    return { totalPct: total, perCorePct: perCore, load, tempC, fanRpm, fanDutyPct, topCpu };
  },
};