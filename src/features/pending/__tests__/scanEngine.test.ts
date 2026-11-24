import { type PendingItem } from '../../../data/pendingItems';
import { loadAll, updateOne } from '../../../data/pendingItems';
import { recognizeImageWithMeta } from '../../../ocr/paddleOcr';
import { extractFromLines } from '../../../domain/receipt/extractFromLines';
import { startBatch, scanOne } from '../scanEngine';

// Hoisted mocks - MUST be at top level
jest.mock('../../../data/pendingItems', () => ({
  loadAll: jest.fn(),
  updateOne: jest.fn(),
}));

jest.mock('../../../ocr/paddleOcr', () => ({
  recognizeImageWithMeta: jest.fn(),
}));

jest.mock('../../../domain/receipt/extractFromLines', () => ({
  extractFromLines: jest.fn(),
}));

jest.mock('react-native-notify-kit', () => {
  const mockNotifee = {
    createChannel: jest.fn().mockResolvedValue(undefined),
    displayNotification: jest.fn().mockResolvedValue(undefined),
  };
  return {
    __esModule: true,
    default: mockNotifee,
    AndroidImportance: { HIGH: 4 },
    EventType: {},
    Notification: {},
  };
});

const mockLoadAll = loadAll as jest.Mock;
const mockUpdateOne = updateOne as jest.Mock;
const mockRecognize = recognizeImageWithMeta as jest.Mock;
const mockExtract = extractFromLines as jest.Mock;

describe('scanEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUnscanned: PendingItem[] = [
    { id: '1', imagePath: 'file:///pending/1.jpg', originalName: 'a.jpg', capturedAt: 1, status: 'unscanned', scanResult: null, error: null, paymentId: null },
    { id: '2', imagePath: 'file:///pending/2.jpg', originalName: 'b.jpg', capturedAt: 2, status: 'unscanned', scanResult: null, error: null, paymentId: null },
  ];

  const mockOcrResult = {
    lines: [{ text: '₹ 100.00', confidence: 0.9, box: { x: 0, y: 0, width: 100, height: 20 } }],
    imageWidth: 1080,
    imageHeight: 1920,
  };

  const mockSuccessResult = {
    amountPaise: 10000,
    payeeName: 'Test Payee',
    paidAt: new Date(),
    duplicateOfPaymentId: undefined,
  };

  const mockRefusalResult = {
    refusal: 'no_amount' as const,
  };

  it('startBatch: success path → sets scanned with scanResult', async () => {
    mockLoadAll.mockResolvedValue(mockUnscanned);
    mockRecognize.mockResolvedValue(mockOcrResult);
    mockExtract.mockReturnValue(mockSuccessResult);

    await startBatch();

    expect(mockUpdateOne).toHaveBeenCalledTimes(4); // 2 items × (scanning + scanned)
    expect(mockUpdateOne).toHaveBeenCalledWith('1', expect.objectContaining({ status: 'scanning' }));
    expect(mockUpdateOne).toHaveBeenCalledWith('1', expect.objectContaining({ status: 'scanned', scanResult: expect.any(Object) }));
    expect(mockUpdateOne).toHaveBeenCalledWith('2', expect.objectContaining({ status: 'scanning' }));
    expect(mockUpdateOne).toHaveBeenCalledWith('2', expect.objectContaining({ status: 'scanned', scanResult: expect.any(Object) }));
  });

  it('startBatch: refusal path → sets error with refusal reason', async () => {
    mockLoadAll.mockResolvedValue([mockUnscanned[0]]);
    mockRecognize.mockResolvedValue(mockOcrResult);
    mockExtract.mockReturnValue(mockRefusalResult);

    await startBatch();

    expect(mockUpdateOne).toHaveBeenCalledWith('1', expect.objectContaining({ status: 'error', error: expect.any(String) }));
  });

  it('startBatch: exception path → sets error with message', async () => {
    mockLoadAll.mockResolvedValue([mockUnscanned[0]]);
    mockRecognize.mockRejectedValue(new Error('OCR crash'));

    await startBatch();

    expect(mockUpdateOne).toHaveBeenCalledWith('1', expect.objectContaining({ status: 'error', error: 'OCR crash' }));
  });

  it('scanOne: single item success', async () => {
    mockLoadAll.mockResolvedValue(mockUnscanned);
    mockRecognize.mockResolvedValue(mockOcrResult);
    mockExtract.mockReturnValue(mockSuccessResult);

    await scanOne('1');

    expect(mockUpdateOne).toHaveBeenCalledWith('1', expect.objectContaining({ status: 'scanning' }));
    expect(mockUpdateOne).toHaveBeenCalledWith('1', expect.objectContaining({ status: 'scanned', scanResult: expect.any(Object) }));
  });

  it('startBatch: persists after each item (mid-scan kill simulation)', async () => {
    mockLoadAll.mockResolvedValue(mockUnscanned);
    mockRecognize.mockResolvedValue(mockOcrResult);
    mockExtract.mockReturnValue(mockSuccessResult);

    await startBatch();

    const calls = mockUpdateOne.mock.calls;
    expect(calls[0][1]).toEqual(expect.objectContaining({ status: 'scanning' }));
    expect(calls[1][1]).toEqual(expect.objectContaining({ status: 'scanned' }));
    expect(calls[2][1]).toEqual(expect.objectContaining({ status: 'scanning' }));
    expect(calls[3][1]).toEqual(expect.objectContaining({ status: 'scanned' }));
  });
});
