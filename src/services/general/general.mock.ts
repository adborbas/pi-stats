import type { GeneralService, GeneralInfo } from "@/services/general/contract";

const start = Date.now();

export const generalService: GeneralService = {
  async get(): Promise<GeneralInfo> {
    const now = Date.now();
    const uptimeSec = Math.floor((now - start) / 1000);
    return {
      os: { hostname: "mock-pi", platform: "linux", arch: "arm64" },
      uptimeSec,
    };
  },
};