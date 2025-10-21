export type MemoryInfo = {
  totalGB: number;
  usedGB: number;
  freeGB: number;
  topProcs: { pid: number; cmd: string; rssMB: number; memPct: number }[];
};

export interface MemoryService  { get(): Promise<MemoryInfo>;  }
