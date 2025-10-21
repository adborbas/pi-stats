export type GeneralInfo = {
  os: { hostname: string; platform: string; arch: string };
  uptimeSec: number;
};

export interface GeneralService { get(): Promise<GeneralInfo>; }
