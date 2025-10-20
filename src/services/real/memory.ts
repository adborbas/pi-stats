import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { MemoryService, MemoryInfo } from "@/services/contracts";

const execFileAsync = promisify(execFile);

type TopProc = { pid: number; cmd: string; rssMB: number; memPct: number };

async function getTopMemProcesses(limit = 20): Promise<TopProc[]> {
  try {
    const { stdout } = await execFileAsync(
      "sh",
      ["-lc", "LC_ALL=C ps -e -o pid=,comm=,rss= --sort=-rss | head -n 100"],
      { env: { ...process.env, LC_ALL: "C" } }
    );
    const totalBytes = os.totalmem();
    const rows: TopProc[] = [];
    stdout
      .trim()
      .split("\n")
      .forEach((line) => {
        const [pidS, cmd, rssKiBS] = line.trim().split(/\s+/, 3);
        const pid = Number(pidS);
        const rssKiB = Number(rssKiBS);
        if (!Number.isFinite(pid) || !Number.isFinite(rssKiB)) return;
        const rssMB = rssKiB / 1024;
        const memPct = Math.max(0, Math.min(100, (rssKiB * 1024 * 100) / totalBytes));
        rows.push({ pid, cmd, rssMB, memPct });
      });
    return rows.slice(0, limit);
  } catch {
    return [];
  }
}

export const memoryService: MemoryService = {
  async get(): Promise<MemoryInfo> {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const topProcs = await getTopMemProcesses(50);

    return {
      totalGB: Number((total / 1024 ** 3).toFixed(2)),
      usedGB: Number((used / 1024 ** 3).toFixed(2)),
      freeGB: Number((free / 1024 ** 3).toFixed(2)),
      topProcs,
    };
  },
};