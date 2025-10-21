import type { StorageService, StorageInfo } from "@/services/storage/contract";

const round = (n: number, d = 1) => Number(n.toFixed(d));
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const storageService: StorageService = {
  async get(): Promise<StorageInfo> {
    const disks = [
      { fs: "/dev/disk1s5", mount: "/",        sizeGB: 120.0, usedGB: 55.2 },
      { fs: "/dev/disk2s1", mount: "/mnt/ssd", sizeGB: 500.0, usedGB: 120.4 },
    ].map(d => ({
      ...d,
      // tiny jitter to feel alive
      usedGB: round(clamp(d.usedGB + (Math.random() - 0.5) * 1.5, 0, d.sizeGB), 1),
      usedPct: round((d.usedGB / d.sizeGB) * 100, 1),
    }));

    const totalMB = 2048;
    const usedMB = clamp(Math.round(totalMB * (0.12 + (Math.random() - 0.5) * 0.04)), 0, totalMB);

    return {
      disks,
      swap: {
        totalMB,
        usedMB,
        usedPct: Number(((usedMB / totalMB) * 100).toFixed(1)),
      },
    };
  },
};