export type HealthLevel = "ok" | "warn" | "crit";

export type HealthSummary = {
  overall: HealthLevel;
  rebootRequired: boolean;
  updates: number;           // total upgradable packages
  failedServices: number;    // count of failed units
  osUpgrade: {
    available: boolean;
    currentMajor?: number | null;
    candidateMajor?: number | null;
    current?: string | null;    // human text if available
    candidate?: string | null;  // human text if available
  };
  updatedAt: number; // epoch ms
};

export type HealthDetails = {
  reboot: { required: boolean; sinceSec?: number | null };
  updates: { count: number; security: number; examples: string[] };
  failed: { count: number; services: string[] };
  osUpgrade: {
    available: boolean;
    current: string | null;
    candidate: string | null;
    currentMajor: number | null;
    candidateMajor: number | null;
  };
  overall: HealthLevel;
  updatedAt: number; // epoch ms
};

export interface HealthService {
  summary(): Promise<HealthSummary>;
  details(): Promise<HealthDetails>;
}