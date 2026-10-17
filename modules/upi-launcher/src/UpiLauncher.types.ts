export interface UpiApp {
  packageName: string;
  label: string;
}

export interface UpiResult {
  action: string | null;
  data: string | null;
  extras: string;
}
