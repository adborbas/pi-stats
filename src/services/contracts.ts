export type GeneralInfo = {
  os: { hostname: string; platform: string; arch: string };
  uptimeSec: number;
};

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

export type MemoryInfo = {
  totalGB: number;
  usedGB: number;
  freeGB: number;
  topProcs: { pid: number; cmd: string; rssMB: number; memPct: number }[];
};

export type StorageInfo = {
  disks: { fs: string; mount: string; sizeGB: number; usedGB: number; usedPct: number }[];
  swap: { totalMB: number; usedMB: number; usedPct: number };
};

export type NetworkInfo = {
  defaultIface: string | null;
  ifaces: { name: string; mac: string; ipv4: string | null; ipv6: string | null }[];
  rates: { name: string; rxMbps: number; txMbps: number }[];
};

export interface GeneralService { get(): Promise<GeneralInfo>; }
export interface CpuService { get(): Promise<CpuInfo>; }
export interface MemoryService  { get(): Promise<MemoryInfo>;  }
export interface StorageService    { get(): Promise<StorageInfo>;    }
export interface NetworkService { get(): Promise<NetworkInfo>; }