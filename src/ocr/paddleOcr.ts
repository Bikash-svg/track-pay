// src/ocr/paddleOcr.ts
//
// ZERO runtime imports from ppu-paddle-ocr/mobile. onnxruntime-react-native's
// binding.js calls Module.install() on NativeModules.Onnxruntime with no null
// check — if that native module isn't registered when the JS module is loaded,
// it throws `Cannot read property 'install' of null` and crashes the app.
//
// Babel's `import type` stripping is unreliable in this codebase, so we do NOT
// use `import type` from ppu-paddle-ocr — inline the shapes locally instead.
// The package loads ONLY via `await import()` inside getOcrService(), after the
// app has mounted and the native bridge is warm.

import { Asset } from 'expo-asset';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { File } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';

// Locally-declared shape — mirrors PaddleOcrService from ppu-paddle-ocr/mobile.
// Kept in sync manually; if the package's API changes, update here.
type PaddleOcrServiceType = {
  initialize(): Promise<void>;
  recognize(
    image: ArrayBuffer,
    options: { flatten: true },
  ): Promise<{
    text: string;
    results: Array<{
      text: string;
      confidence: number;
      box: { x: number; y: number; width: number; height: number };
    }>;
  }>;
  destroy(): Promise<void>;
};

type PaddleOcrServiceCtor = new (options: {
  model: {
    detection: ArrayBuffer;
    recognition: ArrayBuffer;
    charactersDictionary: ArrayBuffer;
  };
}) => PaddleOcrServiceType;

let PaddleOcrServiceClass: PaddleOcrServiceCtor | null = null;
let service: PaddleOcrServiceType | null = null;
let initPromise: Promise<PaddleOcrServiceType> | null = null;

async function loadPaddleOcrClass(): Promise<PaddleOcrServiceCtor> {
  if (PaddleOcrServiceClass) return PaddleOcrServiceClass;
  const mod = await import('ppu-paddle-ocr/mobile');
  PaddleOcrServiceClass = mod.PaddleOcrService as PaddleOcrServiceCtor;
  return PaddleOcrServiceClass;
}


function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function moduleToArrayBuffer(moduleId: number): Promise<ArrayBuffer> {
  const asset = Asset.fromModule(moduleId);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (!uri) {
    throw new Error('OCR asset has no resolvable URI');
  }
  // Read bytes natively via JSI (no base64 bridge expansion).
  // File.bytes() returns Uint8Array; the underlying ArrayBuffer is what
  // ppu-paddle-ocr expects.
  const file = new File(uri);
  const bytes = await file.bytes();
  if (bytes.byteOffset === 0 && bytes.byteLength === bytes.buffer.byteLength) {
    return bytes.buffer as ArrayBuffer;
  }
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function uriToArrayBuffer(uri: string): Promise<{ buffer: ArrayBuffer; width: number; height: number }> {
  // Normalize: resize to 1080 wide, high-quality JPEG re-encode.
  // Small/compressed screenshots (e.g. 29 KB) have text too small to detect;
  // re-encoding at standard width + quality 95 fixes this.
  const manipulated = await manipulateAsync(
    uri,
    [{ resize: { width: 1080 } }],
    { compress: 0.95, format: SaveFormat.JPEG },
  );
  console.log('[OCR-DIAG] original uri:', uri);
  console.log('[OCR-DIAG] resized uri:', manipulated.uri, 'w:', manipulated.width, 'h:', manipulated.height);

  const base64 = await FileSystem.readAsStringAsync(manipulated.uri, { encoding: 'base64' });
  return {
    buffer: base64ToArrayBuffer(base64),
    width: manipulated.width,
    height: manipulated.height,
  };
}

export async function getOcrService(): Promise<PaddleOcrServiceType> {
  if (service) return service;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const PaddleOcrService = await loadPaddleOcrClass();
    const [detBuffer, recBuffer, dictBuffer] = await Promise.all([
      moduleToArrayBuffer(require('../../assets/models/ppocr_v6_medium_det.onnx')),
      moduleToArrayBuffer(require('../../assets/models/ppocr_v6_medium_rec.onnx')),
      moduleToArrayBuffer(require('../../assets/models/character_dict.onnx')),
    ]);

    const svc = new PaddleOcrService({
      model: {
        detection: detBuffer,
        recognition: recBuffer,
        charactersDictionary: dictBuffer,
      },
    });
    await svc.initialize();
    service = svc;
    return svc;
  })();

  return initPromise;
}

export interface OcrLine {
  text: string;
  confidence: number;
  box: { x: number; y: number; width: number; height: number };
}

export async function recognizeImage(uri: string): Promise<OcrLine[]> {
  const { lines } = await recognizeImageWithMeta(uri);
  return lines;
}

export async function recognizeImageWithMeta(
  uri: string,
): Promise<{ lines: OcrLine[]; imageWidth: number; imageHeight: number }> {
  const svc = await getOcrService();
  const { buffer, width, height } = await uriToArrayBuffer(uri);

  const ppuOcv: any = await import('ppu-ocv/canvas-mobile');
  const platform: any = (ppuOcv as any).getPlatform ? (ppuOcv as any).getPlatform() : (ppuOcv as any).default;
  const canvas = await platform.loadImage(buffer);

  const result = await svc.recognize(canvas, { flatten: true } as never);
  return {
    lines: result.results.map((r) => ({
      text: r.text,
      confidence: r.confidence,
      box: r.box,
    })),
    imageWidth: width,
    imageHeight: height,
  };
}
