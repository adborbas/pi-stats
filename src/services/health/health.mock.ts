import type { HealthService, HealthSummary, HealthDetails, HealthLevel } from "./contract";

const start = Date.now();
const jitter = (n: number, d = 2) => Math.max(0, Math.round(n + (Math.random() - 0.5) * d));

function overallFrom(levels: HealthLevel[]): HealthLevel {
  const order: Record<HealthLevel, number> = { ok: 0, warn: 1, crit: 2 };
  return levels.reduce<HealthLevel>((acc, l) => (order[acc] >= order[l] ? acc : l), "ok");
}

export const healthService: HealthService = {
  async summary(): Promise<HealthSummary> {
    const rebootRequired = Math.random() < 0.2;
    const updates = jitter(Math.random() < 0.6 ? 5 : 0, 4);
    const failedServices = Math.random() < 0.15 ? 1 : 0;
    const osUpgrade = { available: Math.random() < 0.1, currentMajor: 12, candidateMajor: 13, current: "Debian 12 (bookworm)", candidate: "Debian 13 (trixie)" };

    const levels: HealthLevel[] = [
      rebootRequired ? "warn" : "ok",
      updates > 20 ? "crit" : updates > 0 ? "warn" : "ok",
      failedServices > 2 ? "crit" : failedServices > 0 ? "warn" : "ok",
      osUpgrade.available ? "warn" : "ok",
    ];
    const overall = overallFrom(levels);

    return {
      overall,
      rebootRequired,
      updates,
      failedServices,
      osUpgrade,
      updatedAt: Date.now(),
    };
  },

  async details(): Promise<HealthDetails> {
    const s = await this.summary();
    const sinceSec = s.rebootRequired ? Math.floor((Date.now() - start) / 1000) : null;
    const examples = s.updates > 0 ? ["openssl", "curl", "sudo", "bash"].slice(0, Math.min(4, s.updates)) : [];
    const services = s.failedServices > 0 ? ["cloudflared.service"] : [];

    return {
      reboot: { required: s.rebootRequired, sinceSec },
      updates: { count: s.updates, security: s.updates > 0 ? 1 : 0, examples },
      failed: { count: s.failedServices, services },
      osUpgrade: {
        available: s.osUpgrade.available,
        current: s.osUpgrade.current ?? "Debian 12 (bookworm)",
        candidate: s.osUpgrade.candidate ?? "Debian 13 (trixie)",
        currentMajor: s.osUpgrade.currentMajor ?? 12,
        candidateMajor: s.osUpgrade.candidateMajor ?? 13,
      },
      overall: s.overall,
      updatedAt: s.updatedAt,
    };
  },
};