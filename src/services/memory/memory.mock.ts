import type { MemoryService, MemoryInfo } from "@/services/memory/contract";

const round = (n: number, d = 2) => Number(n.toFixed(d));
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

// Model: 8 GB total, ~35% used baseline with jitter
const TOTAL_GB = 8.0;

function jitterTop(): MemoryInfo["topProcs"] {
  const base = [
    { pid: 547147, cmd: "node",    rssMB: 800.1, memPct: 9.9 },
    { pid: 548937, cmd: "node",    rssMB: 389.3, memPct: 4.8 },
    { pid: 548936, cmd: "node",    rssMB: 165.0, memPct: 2.0 },
    { pid: 546344, cmd: "node",    rssMB: 155.8, memPct: 1.9 },
    { pid: 548422, cmd: "node",    rssMB: 139.5, memPct: 1.7 },
    { pid: 963,    cmd: "dockerd", rssMB: 93.4,  memPct: 1.1 },
    { pid: 1023,   cmd: "nginx",   rssMB: 45.2,  memPct: 0.6 },
    { pid: 1,      cmd: "init",    rssMB: 12.3,  memPct: 0.2 },
  ];
  return base.map(p => ({
    pid: p.pid,
    cmd: p.cmd,
    rssMB: round(clamp(p.rssMB + (Math.random() - 0.5) * 5, 1, p.rssMB + 10), 1),
    memPct: round(clamp(p.memPct + (Math.random() - 0.5) * 0.4, 0, 100), 1),
  }));
}

export const memoryService: MemoryService = {
  async get(): Promise<MemoryInfo> {
    const usedGB = round(clamp(TOTAL_GB * (0.35 + (Math.random() - 0.5) * 0.05), 0, TOTAL_GB), 2);
    const freeGB = round(TOTAL_GB - usedGB, 2);

    return {
      totalGB: TOTAL_GB,
      usedGB,
      freeGB,
      topProcs: jitterTop(),
    };
  },
};