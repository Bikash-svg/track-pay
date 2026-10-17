import { requireNativeModule } from "expo";
import type { UpiApp, UpiResult } from "../../modules/upi-launcher/src/UpiLauncher.types";

type ListAppsResult =
  | { kind: "found"; result: import("../../modules/upi-launcher/src/UpiLauncher.types").UpiListResult }
  | { kind: "not-found" }
  | { kind: "error"; code: string; message: string };

let nativeModule: any;
try {
  nativeModule = requireNativeModule("UpiLauncher");
} catch {
  nativeModule = undefined;
}

async function openUpi(link: string, packageName?: string): Promise<UpiResult> {
  if (!nativeModule) {
    throw new Error("NATIVE_MODULE_NOT_FOUND: Native module UpiLauncher not found");
  }
  return nativeModule.openUpi(link, packageName);
}

async function listUpiApps(): Promise<ListAppsResult> {
  if (!nativeModule) {
    return { kind: "not-found" };
  }
  try {
    const result = await nativeModule.listUpiApps();
    return { kind: "found", result };
  } catch (e) {
    const err = e as Error & { code?: string };
    return { kind: "error", code: err.code ?? "UNKNOWN", message: err.message ?? String(e) };
  }
}

export { openUpi, listUpiApps };
export type { UpiApp, UpiResult, ListAppsResult };
