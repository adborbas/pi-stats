export type StorageInfo = {
  disks: { fs: string; mount: string; sizeGB: number; usedGB: number; usedPct: number }[];
  swap: { totalMB: number; usedMB: number; usedPct: number };
};

export interface StorageService    { get(): Promise<StorageInfo>;    }
