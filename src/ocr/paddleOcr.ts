// src/ocr/paddleOcr.ts
//
// Wrapper around ppu-paddle-ocr for Track Pay.
// Mobile entry only — the root package uses onnxruntime-node (fails on RN).
// All inputs to recognize() must be ArrayBuffer (no URI overload on mobile).

import { PaddleOcrService } from 'ppu-paddle-ocr/mobile';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

let service: PaddleOcrService | null = null;
let initPromise: Promise<PaddleOcrService> | null = null;

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
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  return base64ToArrayBuffer(base64);
}

async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
  return base64ToArrayBuffer(base64);
}

export async function getOcrService(): Promise<PaddleOcrService> {
  if (service) return service;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const [detBuffer, recBuffer, dictBuffer] = await Promise.all([
      moduleToArrayBuffer(require('../../assets/models/ppocr_v6_medium_det.onnx')),
      moduleToArrayBuffer(require('../../assets/models/ppocr_v6_medium_rec.onnx')),
      moduleToArrayBuffer(require('../../assets/models/character_dict.json')),
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
  const svc = await getOcrService();
  const imageBuffer = await uriToArrayBuffer(uri);
  const result = await svc.recognize(imageBuffer, { flatten: true });
  return result.results.map((r) => ({
    text: r.text,
    confidence: r.confidence,
    box: r.box,
  }));
}
