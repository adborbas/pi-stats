import { CpuService } from "./cpu/contract";
import { GeneralService } from "./general/contract";
import { HealthService } from "./health/contract";
import { MemoryService } from "./memory/contract";
import { NetworkService } from "./network/contract";
import { StorageService } from "./storage/contract";

const MOCK = !!process.env.MOCK;

export * from "./storage/contract";

export const services = {
  general: async (): Promise<GeneralService> => {
    const mod = MOCK ? await import("./general/general.mock") : await import("./general/general");
    return mod.generalService as GeneralService;
  },
  memory: async (): Promise<MemoryService> => {
    const mod = MOCK ? await import("./memory/memory.mock") : await import("./memory/memory");
    return mod.memoryService as MemoryService;
  },
  storage: async (): Promise<StorageService> => {
    const mod = MOCK ? await import("./storage/storage.mock") : await import("./storage/storage");
    return mod.storageService as StorageService;
  },
  network: async (): Promise<NetworkService> => {
    const mod = MOCK ? await import("./network/network.mock") : await import("./network/network");
    return mod.networkService as NetworkService;
  },
  cpu: async (): Promise<CpuService> => {
    const mod = process.env.MOCK ? await import("@/services/cpu/cpu.mock") : await import("@/services/cpu/cpu");
    return mod.cpuService;
  },
  health: async (): Promise<HealthService> => {
    const mod = process.env.MOCK ? await import("@/services/health/health.mock") : await import("@/services/health/health");
    return mod.healthService;
  },
};