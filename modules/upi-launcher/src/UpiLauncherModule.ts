import { NativeModule, requireNativeModule } from 'expo';
import type { UpiApp, UpiResult } from './UpiLauncher.types';

declare class UpiLauncherModule extends NativeModule<{
  openUpi: (link: string, packageName?: string) => Promise<UpiResult>;
  listUpiApps: () => Promise<UpiApp[]>;
}> {}

export type { UpiApp, UpiResult } from './UpiLauncher.types';

export default requireNativeModule<UpiLauncherModule>('UpiLauncher');
