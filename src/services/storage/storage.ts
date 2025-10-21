import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import type { StorageService, StorageInfo } from "@/services/storage/contract";

const execFileAsync = promisify(execFile);

async function getDiskUsage() {
  const { stdout } = await execFileAsync("sh", [
    "-lc",
    "df -kP | awk 'NR>1{print $1, $2, $3, $6}'",
  ]);
  const rows: Array<{ fs: string; mount: string; sizeGB: number; usedGB: number; usedPct: number }> = [];
  stdout
    .trim()
    .split("\n")
    .forEach((l) => {
      const [fsname, blocks, used, mount] = l.trim().split(/\s+/);
      if (!fsname || !blocks || !used || !mount) return;
      const sizeGB = Number(((Number(blocks) * 1024) / 1e9).toFixed(2));
      const usedGB = Number(((Number(used) * 1024) / 1e9).toFixed(2));
      const usedPct = sizeGB > 0 ? Number(((usedGB / sizeGB) * 100).toFixed(1)) : 0;
      rows.push({ fs: fsname, mount, sizeGB, usedGB, usedPct });
    });
  return rows.filter((r) =>
    ["/", "/boot", "/boot/firmware", "/mnt", "/mnt/ssd"].some((p) => r.mount === p) || r.mount === "/"
  );
}

async function getSwapUsage() {
  const meminfo = await fs.readFile("/proc/meminfo", "utf8");
  const m = (key: string) => {
    const r = meminfo.match(new RegExp(`^${key}:\\s+(\\d+) kB`, "m"));
    return r ? Number(r[1]) : 0;
  };
  const totalKB = m("SwapTotal");
  const freeKB = m("SwapFree");
  const usedKB = Math.max(0, totalKB - freeKB);
  return {
    totalMB: Number((totalKB / 1024).toFixed(0)),
    usedMB: Number((usedKB / 1024).toFixed(0)),
    usedPct: totalKB ? Number(((usedKB / totalKB) * 100).toFixed(1)) : 0,
  };
}

export const storageService: StorageService = {
  async get(): Promise<StorageInfo> {
    const [disks, swap] = await Promise.all([getDiskUsage(), getSwapUsage()]);
    return { disks, swap };
  },
};