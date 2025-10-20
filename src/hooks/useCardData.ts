import useSWR from "swr";
const f = (u: string) => fetch(u, { cache: "no-store" }).then(r => r.json());

export function useGeneral(ms: number) {
  return useSWR("/api/cards/general", f, { refreshInterval: ms, revalidateOnFocus: false });
}
export function useMemory(ms: number) {
  return useSWR("/api/cards/memory", f, { refreshInterval: ms, revalidateOnFocus: false });
}
export function useStorage() {
  return useSWR("/api/cards/storage", f, { revalidateOnFocus: false });
}
export function useNetwork(ms: number) {
  return useSWR("/api/cards/network", f, { refreshInterval: ms, revalidateOnFocus: false });
}