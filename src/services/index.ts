import type { GeneralService, MemoryService, StorageService, NetworkService } from "./contracts";

const MOCK = !!process.env.MOCK;

export * from "./contracts";

export const services = {
  general: async (): Promise<GeneralService> => {
    const mod = MOCK ? await import("./mock/general") : await import("./real/general");
    return mod.generalService as GeneralService;
  },
  memory: async (): Promise<MemoryService> => {
    const mod = MOCK ? await import("./mock/memory") : await import("./real/memory");
    return mod.memoryService as MemoryService;
  },
  storage: async (): Promise<StorageService> => {
    const mod = MOCK ? await import("./mock/storage") : await import("./real/storage");
    return mod.storageService as StorageService;
  },
  network: async (): Promise<NetworkService> => {
    const mod = MOCK ? await import("./mock/network") : await import("./real/network");
    return mod.networkService as NetworkService;
  },
  cpu: async () => {
    const mod = process.env.MOCK ? await import("@/services/mock/cpu") : await import("@/services/real/cpu");
    return mod.cpuService;
  },
};