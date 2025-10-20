import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import type { GeneralService, GeneralInfo } from "@/services/contracts";

const execFileAsync = promisify(execFile);

async function getCpuTemp(): Promise<number | null> {
  try {
    const { stdout } = await execFileAsync("vcgencmd", ["measure_temp"]);
    const m = stdout.match(/temp=([\d.]+)/);
    if (m) return parseFloat(m[1]);
  } catch {}
  try {
    const raw = (await fs.readFile("/sys/class/thermal/thermal_zone0/temp", "utf8")).trim();
    const v = Number(raw);
    if (!Number.isNaN(v)) return v / 1000;
  } catch {}
  return null;
}

function getUptimeLoad() {
  const [l1, l5, l15] = os.loadavg();
  return {
    uptimeSec: os.uptime(),
    l1: Number(l1.toFixed(2)),
    l5: Number(l5.toFixed(2)),
    l15: Number(l15.toFixed(2)),
    cpus: os.cpus().length,
  };
}

async function readFirstExisting(filepaths: string[]): Promise<string | null> {
  for (const p of filepaths) {
    try {
      const s = (await fs.readFile(p, "utf8")).trim();
      return s;
    } catch {}
  }
  return null;
}

async function getFanInfo(): Promise<{ rpm: number | null; dutyPct: number | null }> {
  // Enumerate hwmon directories and try to find a fan sensor or PWM controller
  const base = "/sys/class/hwmon";
  let rpm: number | null = null;
  let dutyPct: number | null = null;

  try {
    const entries = await fs.readdir(base);
    for (const entry of entries) {
      if (!entry.startsWith("hwmon")) continue;
      const dir = path.join(base, entry);
      // Try RPM first
      const rpmStr = await readFirstExisting([
        path.join(dir, "fan1_input"),
        path.join(dir, "fan_input"),
      ]);
      if (rpmStr) {
        const v = Number(rpmStr);
        if (Number.isFinite(v) && v > 0) rpm = Math.round(v);
      }

      // Try PWM duty (0-255 or pwm1_max-defined)
      const pwmStr = await readFirstExisting([path.join(dir, "pwm1")]);
      if (pwmStr) {
        const raw = Number(pwmStr);
        if (Number.isFinite(raw)) {
          let max = 255;
          const maxStr = await readFirstExisting([path.join(dir, "pwm1_max")]);
          if (maxStr) {
            const m = Number(maxStr);
            if (Number.isFinite(m) && m > 0) max = m;
          }
          const pct = Math.max(0, Math.min(100, (raw / max) * 100));
          dutyPct = Number(pct.toFixed(0));
        }
      }

      if (rpm !== null || dutyPct !== null) break; // we found something useful
    }
  } catch {}

  return { rpm, dutyPct };
}

export const generalService: GeneralService = {
  async get(): Promise<GeneralInfo> {
    const [cpuTemp, load, fan] = await Promise.all([
      getCpuTemp(),
      Promise.resolve(getUptimeLoad()),
      getFanInfo(),
    ]);

    return {
      os: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
      },
      cpuTemp,
      uptimeSec: load.uptimeSec,
      load: { l1: load.l1, l5: load.l5, l15: load.l15, cpus: load.cpus },
      fanRpm: fan.rpm,
      fanDutyPct: fan.dutyPct,
    };
  },
};