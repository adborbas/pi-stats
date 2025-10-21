import os from "node:os";
import type { GeneralService, GeneralInfo } from "@/services/contracts";

function getUptime() {
  return Math.floor(os.uptime());
}

export const generalService: GeneralService = {
  async get(): Promise<GeneralInfo> {
    return {
      os: {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
      },
      uptimeSec: getUptime(),
    };
  },
};