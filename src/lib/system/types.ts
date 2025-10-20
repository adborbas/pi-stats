export type TopProc = { pid: number; cmd: string; rssMB: number; memPct: number };
export type DiskUsage = { fs: string; mount: string; sizeGB: number; usedGB: number; usedPct: number };
export type IfRates = { name: string; rxMbps: number; txMbps: number };
export type IfInfo  = { name: string; mac: string; ipv4: string|null; ipv6: string|null };