export interface UpiApp {
  packageName: string;
  label: string;
}

export interface UpiResult {
  action: string | null;
  data: string | null;
  extras: string;
}

export interface UpiListProbe {
  flags: number;
  count: number;
  apps: UpiApp[];
}

export interface UpiListResult {
  sdkInt: number;
  matchDefaultOnly: UpiListProbe;
  flagsZero: UpiListProbe;
}
