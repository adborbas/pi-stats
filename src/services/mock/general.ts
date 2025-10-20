import type { GeneralService, GeneralInfo } from "@/services/contracts";

// Lightweight in-file mock with gentle time-based drift
const start = Date.now();
const round = (n: number, d = 2) => Number(n.toFixed(d));
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const generalService: GeneralService = {
  async get(): Promise<GeneralInfo> {
    const now = Date.now();
    const uptimeSec = Math.floor((now - start) / 1000);
    const cpus = 4; // pretend quad-core

    // Gentle, realistic-ish load curves
    const l1Base = 0.35 + Math.sin(uptimeSec / 60) * 0.06;
    const l5Base = 0.4 + Math.sin(uptimeSec / 180) * 0.05;
    const l15Base = 0.25 + Math.sin(uptimeSec / 600) * 0.04;

    const l1 = round(clamp(l1Base + (Math.random() - 0.5) * 0.02, 0, cpus), 2);
    const l5 = round(clamp(l5Base + (Math.random() - 0.5) * 0.02, 0, cpus), 2);
    const l15 = round(clamp(l15Base + (Math.random() - 0.5) * 0.02, 0, cpus), 2);

    // CPU temp around 48°C
    const drift = Math.sin((now - start) / 15000) * 0.7;
    const cpuTemp = round(48 + drift + (Math.random() - 0.5) * 1.0, 1);

    // Fan: 1000–1800 RPM w/ light jitter; duty 35–70%
    const fanRpm = Math.round(1400 + Math.sin((now - start) / 8000) * 300 + (Math.random() - 0.5) * 80);
    const fanDutyPct = Math.max(0, Math.min(100, Math.round(52 + Math.sin((now - start) / 9000) * 18)));

    const data: GeneralInfo = {
      os: { hostname: "mock-pi", platform: "linux", arch: "arm64" },
      cpuTemp,
      uptimeSec,
      load: { l1, l5, l15, cpus },
      fanRpm,
      fanDutyPct,
    };

    return data;
  },
};