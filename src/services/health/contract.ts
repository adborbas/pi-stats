export type HealthLevel = "ok" | "warn" | "crit";

export type HealthSnapshot = {
  overall: HealthLevel;        // computed from checks
  reboot: { required: boolean; sinceSec: number | null };
  updates: { count: number; security: number; examples: string[] };
  failed:  { count: number; services: string[] };
  osUpgrade: {
    available: boolean;
    current: string | null;         // e.g., "Debian 12 (bookworm)"
    candidate: string | null;       // e.g., "Debian 13 (trixie)" or version
    currentMajor: number | null;
    candidateMajor: number | null;
  };
  updatedAt: number; // epoch ms
};

export interface HealthService {
  get(): Promise<HealthSnapshot>;
}