export type CpuInfo = {
  // usage
  totalPct: number;              // 0–100
  perCorePct: number[];          // length = cpu cores
  // load
  load: { l1: number; l5: number; l15: number; cpus: number };
  // thermals & cooling
  tempC: number | null;
  fanRpm?: number | null;
  fanDutyPct?: number | null;
  // top processes by cpu
  topCpu: { pid: number; cmd: string; cpuPct: number }[];
};

export interface CpuService { get(): Promise<CpuInfo>; }