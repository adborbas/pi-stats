export type NetworkInfo = {
  defaultIface: string | null;
  ifaces: { name: string; mac: string; ipv4: string | null; ipv6: string | null }[];
  rates: { name: string; rxMbps: number; txMbps: number }[];
};

export interface NetworkService { get(): Promise<NetworkInfo>; }
