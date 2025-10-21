import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import type { NetworkService, NetworkInfo } from "@/services/network/contract";

const execFileAsync = promisify(execFile);

// Keep last counters to compute Mbps between calls
const lastNet: Record<string, { rx: number; tx: number; t: number }> = {};

async function getNetworkThroughput() {
  const { stdout } = await execFileAsync("sh", ["-lc", "ls -1 /sys/class/net | grep -v '^lo$'"]);
  const ifaces = stdout.trim().split("\n").filter(Boolean);
  const now = Date.now();
  const out: { name: string; rxMbps: number; txMbps: number }[] = [];

  for (const name of ifaces) {
    try {
      const [rxS, txS] = await Promise.all([
        fs.readFile(`/sys/class/net/${name}/statistics/rx_bytes`, "utf8"),
        fs.readFile(`/sys/class/net/${name}/statistics/tx_bytes`, "utf8"),
      ]);
      const rx = Number(rxS.trim());
      const tx = Number(txS.trim());
      const prev = lastNet[name];
      if (prev) {
        const dt = Math.max(1, now - prev.t) / 1000;
        const rxMbps = ((rx - prev.rx) * 8) / (dt * 1e6);
        const txMbps = ((tx - prev.tx) * 8) / (dt * 1e6);
        out.push({
          name,
          rxMbps: Number(Math.max(0, rxMbps).toFixed(2)),
          txMbps: Number(Math.max(0, txMbps).toFixed(2)),
        });
      }
      lastNet[name] = { rx, tx, t: now };
    } catch {}
  }
  return out;
}

async function getInterfaceInfo() {
  try {
    const { stdout } = await execFileAsync("sh", ["-lc", "ip -j addr"]);
    const arr = JSON.parse(stdout) as Array<{ ifname: string; address?: string; addr_info?: Array<{ family: string; local: string }>; }>;
    const out: Array<{ name: string; mac: string; ipv4: string | null; ipv6: string | null }> = [];
    for (const link of arr) {
      const name = link.ifname;
      if (!name || name === "lo") continue;
      const mac = link.address || "";
      let ipv4: string | null = null;
      let ipv6: string | null = null;
      const addrs = Array.isArray(link.addr_info) ? link.addr_info : [];
      for (const a of addrs) {
        if (a.family === "inet" && !ipv4) ipv4 = a.local;
        if (a.family === "inet6" && !ipv6 && !String(a.local).startsWith("fe80:")) ipv6 = a.local;
      }
      out.push({ name, mac, ipv4, ipv6 });
    }
    return out;
  } catch {
    const map = os.networkInterfaces();
    const out: Array<{ name: string; mac: string; ipv4: string | null; ipv6: string | null }> = [];
    for (const [name, addrs] of Object.entries(map)) {
      const list = (addrs ?? []) as os.NetworkInterfaceInfo[];
      if (list.length === 0 || name === "lo") continue;
      const nonInternal = list.filter((a) => !a.internal);
      if (nonInternal.length === 0) continue;
      const mac = nonInternal.find((a) => typeof (a as os.NetworkInterfaceInfo).mac === "string" && a.mac !== "00:00:00:00:00:00")?.mac || "";
      const ipv4 = nonInternal.find((a) => a.family === "IPv4")?.address ?? null;
      const ipv6 = nonInternal.find((a) => a.family === "IPv6")?.address ?? null;
      out.push({ name, mac, ipv4, ipv6 });
    }
    return out;
  }
}

async function getDefaultInterface(): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("sh", ["-lc", "ip -j route get 1.1.1.1"]);
    const arr = JSON.parse(stdout) as Array<{ dev?: string }>;
    const dev = arr?.[0]?.dev;
    return dev || null;
  } catch {
    try {
      const { stdout } = await execFileAsync("sh", ["-lc", "ip -j route"]);
      const arr = JSON.parse(stdout) as Array<{ dst?: string; dev?: string }>;
      const def = arr.find((r) => r.dst === "default");
      return def?.dev || null;
    } catch {
      return null;
    }
  }
}

export const networkService: NetworkService = {
  async get(): Promise<NetworkInfo> {
    const [rates, ifaces, defaultIface] = await Promise.all([
      getNetworkThroughput(),
      getInterfaceInfo(),
      getDefaultInterface(),
    ]);
    return { defaultIface, ifaces, rates };
  },
};