import type { HealthService, HealthSnapshot, HealthLevel } from "./contract";

const start = Date.now();
const jitter = (n: number, d = 2) => Math.max(0, Math.round(n + (Math.random() - 0.5) * d));

function overallFrom(levels: HealthLevel[]): HealthLevel {
  const order: Record<HealthLevel, number> = { ok: 0, warn: 1, crit: 2 };
  return levels.reduce<HealthLevel>((acc, l) => (order[acc] >= order[l] ? acc : l), "ok");
}

export const healthService: HealthService = {
  async get(): Promise<HealthSnapshot> {
    const rebootRequired = Math.random() < 0.2;
    const updates = jitter(Math.random() < 0.6 ? 5 : 0, 4);
    const failedServices = Math.random() < 0.15 ? 1 : 0;
    const osUpgradeAvail = Math.random() < 0.1;

    const levels: HealthLevel[] = [
      rebootRequired ? "warn" : "ok",
      updates > 20 ? "crit" : updates > 0 ? "warn" : "ok",
      failedServices > 2 ? "crit" : failedServices > 0 ? "warn" : "ok",
      osUpgradeAvail ? "warn" : "ok",
    ];
    const overall = overallFrom(levels);

    const snap: HealthSnapshot = {
      overall,
      reboot: { required: rebootRequired, sinceSec: rebootRequired ? Math.floor((Date.now() - start) / 1000) : 0 },
      updates: { count: updates, security: updates > 0 ? 1 : 0, examples: updates > 0 ? ["openssl", "curl", "sudo", "bash"].slice(0, Math.min(4, updates)) : [] },
      failed: { count: failedServices, services: failedServices ? ["cloudflared.service"] : [] },
      osUpgrade: {
        available: osUpgradeAvail,
        current: "Debian 12 (bookworm)",
        candidate: osUpgradeAvail ? "Debian 13 (trixie)" : null,
        currentMajor: 12,
        candidateMajor: osUpgradeAvail ? 13 : null,
      },
      updatedAt: Date.now(),
    };

    return snap;
  },
};