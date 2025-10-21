import type { NetworkService, NetworkInfo } from "@/services/network/contract";

const round = (n: number, d = 2) => Number(n.toFixed(d));
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const networkService: NetworkService = {
  async get(): Promise<NetworkInfo> {
    const rates = [
      { name: "en0",     rx: 12.34, tx: 1.23 },
      { name: "en1",     rx: 0.0,   tx: 0.0  },
      { name: "bridge0", rx: 0.58,  tx: 0.42 },
    ].map(r => ({
      name: r.name,
      rxMbps: round(clamp(r.rx + (Math.random() - 0.5) * 0.7, 0, 1_000), 2),
      txMbps: round(clamp(r.tx + (Math.random() - 0.5) * 0.7, 0, 1_000), 2),
    }));

    const ifaces = [
      { name: "en0",     mac: "a1:b2:c3:d4:e5:f6", ipv4: "192.168.1.23", ipv6: null },
      { name: "en1",     mac: "b2:c3:d4:e5:f6:a1", ipv4: null,            ipv6: null },
      { name: "bridge0", mac: "02:00:00:00:00:00", ipv4: "192.168.64.1",  ipv6: null },
    ];

    const data: NetworkInfo = {
      defaultIface: "en0",
      ifaces,
      rates,
    };
    return data;
  },
};