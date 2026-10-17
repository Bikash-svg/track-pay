import UpiLauncherNativeModule from "../../modules/upi-launcher/src/UpiLauncherModule";
import type { UpiApp, UpiResult } from "../../modules/upi-launcher/src/UpiLauncher.types";

async function openUpi(link: string, packageName?: string): Promise<UpiResult> {
  return UpiLauncherNativeModule.openUpi(link, packageName);
}

async function listUpiApps(): Promise<UpiApp[]> {
  return UpiLauncherNativeModule.listUpiApps();
}

export { openUpi, listUpiApps };
export type { UpiApp, UpiResult };
