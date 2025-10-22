import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import type { HealthService, HealthSnapshot, HealthLevel } from "./contract";

const execFileAsync = promisify(execFile);

// --- helpers -------------------------------------------------

async function fileExists(p: string): Promise<boolean> {
  try { await fs.access(p); return true; } catch { return false; }
}

function levelMax(a: HealthLevel, b: HealthLevel): HealthLevel {
  const order: Record<HealthLevel, number> = { ok: 0, warn: 1, crit: 2 };
  return order[a] >= order[b] ? a : b;
}

function overallFrom(levels: HealthLevel[]): HealthLevel {
  return levels.reduce<HealthLevel>((acc, l) => levelMax(acc, l), "ok");
}

// --- probes --------------------------------------------------

// 1) Reboot required
async function probeReboot(): Promise<{ required: boolean; sinceSec: number | null; level: HealthLevel }> {
  const p = "/run/reboot-required";
  const required = await fileExists(p);
  let sinceSec: number | null = null;
  try {
    const s = await fs.stat(p);
    sinceSec = Math.max(0, Math.floor((Date.now() - s.mtimeMs) / 1000));
  } catch {}
  const level: HealthLevel = required ? (sinceSec != null && sinceSec > 7 * 86400 ? "crit" : "warn") : "ok";
  return { required, sinceSec, level };
}

// 2) Updates available (count + security approx + examples)
async function probeUpdates(): Promise<{ count: number; security: number; examples: string[]; level: HealthLevel }> {
  try {
    const { stdout } = await execFileAsync("bash", ["-lc", "apt list --upgradable 2>/dev/null | tail -n +2"]);
    const lines = stdout.trim().split("\n").filter(Boolean);
    const count = lines.length;
    const security = lines.filter(l => /security/i.test(l)).length;
    const examples = lines.slice(0, 5).map(l => l.split("/")[0]?.trim() || l.trim());

    let level: HealthLevel = "ok";
    if (count > 0) level = (count > 20 || security > 0) ? "crit" : "warn";

    return { count, security, examples, level };
  } catch {
    return { count: 0, security: 0, examples: [], level: "ok" };
  }
}

// 3) Failed services (systemctl)
async function probeFailedServices(): Promise<{ count: number; services: string[]; level: HealthLevel }> {
  try {
    const { stdout } = await execFileAsync("bash", ["-lc", "systemctl --failed --no-legend --plain | awk '{print $1}'"]);
    const services = stdout.trim().split("\n").map(s => s.trim()).filter(Boolean);
    const count = services.length;

    const essential = new Set([
      "cloudflared.service",
      "docker.service",
      "ssh.service",
      "systemd-networkd.service",
      "NetworkManager.service",
    ]);
    const hasEssential = services.some(s => essential.has(s));

    let level: HealthLevel = "ok";
    if (count > 0) level = hasEssential || count > 2 ? "crit" : "warn";

    return { count, services, level };
  } catch {
    return { count: 0, services: [], level: "ok" };
  }
}

// 4) OS upgrade available (Debian/RPi OS heuristic via base-files candidate)
async function probeOsUpgrade(): Promise<{
  available: boolean;
  current: string | null;
  candidate: string | null;
  currentMajor: number | null;
  candidateMajor: number | null;
  level: HealthLevel;
}> {
  let current: string | null = null;
  let candidate: string | null = null;
  let currentMajor: number | null = null;
  let candidateMajor: number | null = null;

  try {
    const osRelease = await fs.readFile("/etc/os-release", "utf8");
    const name = /PRETTY_NAME="([^"]+)"/.exec(osRelease)?.[1] ?? null;
    current = name;

    try {
      const debver = (await fs.readFile("/etc/debian_version", "utf8")).trim();
      const m = debver.match(/^(\d+)/);
      if (m) currentMajor = Number(m[1]);
    } catch {}

    const { stdout } = await execFileAsync("bash", ["-lc", "apt-cache policy base-files | awk '/Candidate:/ {print $2}'"]);
    candidate = stdout.trim() || null;
    const cmaj = candidate?.match(/^(\d+)/);
    if (cmaj) candidateMajor = Number(cmaj[1]);
  } catch {
    // ignore
  }

  const available = currentMajor != null && candidateMajor != null && candidateMajor > currentMajor;
  const level: HealthLevel = available ? "warn" : "ok";

  return { available, current, candidate, currentMajor, candidateMajor, level };
}

// --- caching layer -------------------------------------------

type Cache = { snap: HealthSnapshot | null; ts: number };
let cache: Cache = { snap: null, ts: 0 };
const TTL_MS = 5 * 60 * 1000; // 5 minutes

async function compute(): Promise<HealthSnapshot> {
  const [reboot, updates, failed, osup] = await Promise.all([
    probeReboot(),
    probeUpdates(),
    probeFailedServices(),
    probeOsUpgrade(),
  ]);

  const overall = overallFrom([reboot.level, updates.level, failed.level, osup.level]);

  const snap: HealthSnapshot = {
    overall,
    reboot: { required: reboot.required, sinceSec: reboot.sinceSec ?? null },
    updates: { count: updates.count, security: updates.security, examples: updates.examples },
    failed: { count: failed.count, services: failed.services },
    osUpgrade: {
      available: osup.available,
      current: osup.current ?? null,
      candidate: osup.candidate ?? null,
      currentMajor: osup.currentMajor ?? null,
      candidateMajor: osup.candidateMajor ?? null,
    },
    updatedAt: Date.now(),
  };

  return snap;
}

async function getCached(): Promise<HealthSnapshot> {
  const now = Date.now();
  if (cache.snap && now - cache.ts < TTL_MS) return cache.snap;
  const snap = await compute();
  cache = { snap, ts: Date.now() };
  return snap;
}

// --- service -------------------------------------------------

export const healthService: HealthService = {
  async get(): Promise<HealthSnapshot> {
    return getCached();
  },
};