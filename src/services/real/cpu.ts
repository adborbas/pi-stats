import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import type { CpuService, CpuInfo } from "@/services/contracts";

const execFileAsync = promisify(execFile);

// --- usage (delta-based) ---
type CpuTimes = { idle: number; total: number };
let last: CpuTimes[] | null = null;

function snapshot(): CpuTimes[] {
  return os.cpus().map((c) => {
    const t = c.times;
    const total = t.user + t.nice + t.sys + t.idle + t.irq;
    return { idle: t.idle, total };
  });
}

function usageFrom(prev: CpuTimes[], next: CpuTimes[]): { totalPct: number; perCorePct: number[] } {
  const per: number[] = [];
  let totalBusy = 0;
  let totalAll = 0;
  for (let i = 0; i < next.length; i++) {
    const di = Math.max(0, next[i].idle - prev[i].idle);
    const dt = Math.max(1, next[i].total - prev[i].total);
    const busy = Math.max(0, dt - di);
    per.push(Number(((busy / dt) * 100).toFixed(1)));
    totalBusy += busy;
    totalAll += dt;
  }
  const totalPct = Number(((totalBusy / totalAll) * 100).toFixed(1));
  return { totalPct, perCorePct: per };
}

// --- load ---
function readLoad() {
  const [l1, l5, l15] = os.loadavg();
  return {
    l1: Number(l1.toFixed(2)),
    l5: Number(l5.toFixed(2)),
    l15: Number(l15.toFixed(2)),
    cpus: os.cpus().length,
  };
}

// --- temp & fan (similar to your previous general) ---
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

async function readFirstExisting(filepaths: string[]): Promise<string | null> {
  for (const p of filepaths) {
    try {
      const s = (await fs.readFile(p, "utf8")).trim();
      return s;
    } catch {}
  }
  return null;
}

async function getFan(): Promise<{ rpm: number | null; dutyPct: number | null }> {
  const base = "/sys/class/hwmon";
  let rpm: number | null = null;
  let dutyPct: number | null = null;
  try {
    const entries = await fs.readdir(base);
    for (const entry of entries) {
      if (!entry.startsWith("hwmon")) continue;
      const dir = path.join(base, entry);

      const rpmStr = await readFirstExisting([path.join(dir, "fan1_input"), path.join(dir, "fan_input")]);
      if (rpmStr) {
        const v = Number(rpmStr);
        if (Number.isFinite(v) && v > 0) rpm = Math.round(v);
      }

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

      if (rpm !== null || dutyPct !== null) break;
    }
  } catch {}
  return { rpm, dutyPct };
}

// --- top processes by CPU (simple ps fallback) ---
async function topCpu(): Promise<{ pid: number; cmd: string; cpuPct: number }[]> {
  try {
    const { stdout } = await execFileAsync("bash", ["-lc", "ps -e -o pid=,comm=,pcpu= --sort=-pcpu | head -n 15"]);
    return stdout
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const m = l.match(/^\\s*(\\d+)\\s+(\\S+)\\s+([\\d.]+)/);
        if (!m) return null;
        return { pid: Number(m[1]), cmd: m[2], cpuPct: Number(parseFloat(m[3]).toFixed(1)) };
      })
      .filter(Boolean) as any;
  } catch {
    return [];
  }
}

export const cpuService: CpuService = {
  async get(): Promise<CpuInfo> {
    const snap = snapshot();
    const prev = last ?? snap; // first call: zero delta
    last = snap;

    const { totalPct, perCorePct } = usageFrom(prev, snap);
    const [tempC, fan, top, load] = await Promise.all([getCpuTemp(), getFan(), topCpu(), Promise.resolve(readLoad())]);

    return {
      totalPct,
      perCorePct,
      load,
      tempC,
      fanRpm: fan.rpm ?? null,
      fanDutyPct: fan.dutyPct ?? null,
      topCpu: top,
    };
  },
};