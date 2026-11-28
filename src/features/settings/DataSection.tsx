import { useState, useEffect } from 'react';
import { Alert, Linking, Platform, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { Text, Button, copy } from '../../ui';
import { useTheme } from '../../ui/useTheme';
import { usePayments } from '../../data/payments';
import { setLastExport, getLastExport } from '../../data/settings';

const CURRENT_SCHEMA_VERSION = 1;

export interface StoredPayment {
  readonly id: string;
  readonly amountPaise: number;
  readonly payeeName: string;
  readonly payeeVpa: string | null;
  readonly label: string | null;
  readonly category: string;
  readonly status: string;
  readonly source: string;
  readonly reviewed: boolean;
  readonly createdAt: number;
  readonly paidAt: number | null;
  readonly upiRef: string | null;
}

export interface StoredExport {
  readonly version: number;
  readonly payments: StoredPayment[];
  readonly exportedAt: number;
}

export interface DataActions {
  readonly handleExportBackup: () => Promise<void>;
  readonly handleImport: () => Promise<void>;
  readonly handlePdfStatement: () => Promise<void>;
}

// Hook that encapsulates all data export/import logic. Can be used by
// both DataSection (Settings) and history.tsx (Export dialog).
export function useDataActions(): DataActions {
  const { payments, addPayment, deletePayment } = usePayments();

  const handleExportBackup = async () => {
    Alert.alert(
      copy.exportDataWarningTitle,
      copy.exportDataWarningMessage,
      [
        { text: copy.cancel, style: 'cancel' },
        {
          text: copy.export,
          onPress: async () => {
            const data: StoredExport = {
              version: CURRENT_SCHEMA_VERSION,
              payments: payments as unknown as StoredPayment[],
              exportedAt: Date.now(),
            };
            const json = JSON.stringify(data, null, 2);
            const fileUri = FileSystem.cacheDirectory + 'trackpay-backup.json';
            try {
              await FileSystem.writeAsStringAsync(fileUri, json);
              if (Platform.OS === 'android') {
                try {
                  await Linking.openURL(fileUri);
                } catch {
                  // Fallback: file written to cache, sharing not available
                }
              }
              await setLastExport(Date.now());
            } catch {
              Alert.alert(copy.error, copy.exportFailed);
            }
          },
        },
      ]
    );
  };

  const handleImport = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
    });
    if (result.canceled || !result.assets[0]) return;

    const uri = result.assets[0].uri;
    let raw: string;
    try {
      raw = await FileSystem.readAsStringAsync(uri);
    } catch {
      Alert.alert(copy.error, copy.importInvalidFile);
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      Alert.alert(copy.error, copy.importInvalidFile);
      return;
    }

    // Validate structure
    const exportData = parsed as StoredExport | null;
    if (
      !exportData ||
      typeof exportData.version !== 'number' ||
      !Array.isArray(exportData.payments)
    ) {
      Alert.alert(copy.error, copy.importInvalidFile);
      return;
    }

    // Version check (D2)
    if (exportData.version > CURRENT_SCHEMA_VERSION) {
      Alert.alert(copy.error, copy.importNewerVersion);
      return;
    }

    // Validate each payment (D3)
    const validPayments: StoredPayment[] = [];
    for (const p of exportData.payments) {
      if (
        typeof p.id !== 'string' ||
        typeof p.amountPaise !== 'number' ||
        typeof p.payeeName !== 'string' ||
        typeof p.category !== 'string' ||
        typeof p.status !== 'string' ||
        typeof p.source !== 'string' ||
        typeof p.reviewed !== 'boolean' ||
        typeof p.createdAt !== 'number'
      ) {
        Alert.alert(copy.error, copy.importInvalidFile);
        return;
      }
      validPayments.push(p);
    }

    // Ask merge vs replace
    Alert.alert(
      copy.importTitle,
      copy.importQuestion.replace('{n}', String(validPayments.length)),
      [
        { text: copy.cancel, style: 'cancel' },
        {
          text: copy.importMerge,
          onPress: async () => handleMerge(validPayments),
        },
        {
          text: copy.importReplace,
          onPress: async () => handleReplace(validPayments),
        },
      ]
    );
  };

  const handleMerge = async (paymentsToImport: StoredPayment[]) => {
    const existingIds = new Set(payments.map((p) => p.id));
    const existingUpiRefs = new Set(
      payments
        .filter((p) => p.upiRef)
        .map((p) => p.upiRef)
    );
    let imported = 0;
    let skipped = 0;

    for (const p of paymentsToImport) {
      const isDuplicate =
        existingIds.has(p.id) || (p.upiRef && existingUpiRefs.has(p.upiRef));
      if (isDuplicate) {
        skipped++;
        continue;
      }
      await addPayment({
        amountPaise: p.amountPaise,
        payeeName: p.payeeName,
        label: p.label ?? null,
        category: p.category as any,
        createdAt: new Date(p.createdAt),
        paidAt: p.paidAt ? new Date(p.paidAt) : null,
        upiRef: p.upiRef ?? null,
        source: p.source as any,
        reviewed: p.reviewed,
      });
      imported++;
    }

    Alert.alert(
      copy.importDoneTitle,
      copy.importDoneMessage
        .replace('{imported}', String(imported))
        .replace('{skipped}', String(skipped)),
      [{ text: copy.close }]
    );
  };

  const handleReplace = async (paymentsToImport: StoredPayment[]) => {
    // Delete all existing payments one by one
    const existingIds = payments.map((p) => p.id);
    for (const id of existingIds) {
      await deletePayment(id);
    }

    let imported = 0;
    for (const p of paymentsToImport) {
      await addPayment({
        amountPaise: p.amountPaise,
        payeeName: p.payeeName,
        label: p.label ?? null,
        category: p.category as any,
        createdAt: new Date(p.createdAt),
        paidAt: p.paidAt ? new Date(p.paidAt) : null,
        upiRef: p.upiRef ?? null,
        source: p.source as any,
        reviewed: p.reviewed,
      });
      imported++;
    }

    Alert.alert(
      copy.importDoneTitle,
      copy.importDoneMessage
        .replace('{imported}', String(imported))
        .replace('{skipped}', '0'),
      [{ text: copy.close }]
    );
  };

  const handlePdfStatement = async () => {
    Alert.alert(copy.pdfComingSoonTitle, copy.pdfComingSoonMessage, [
      { text: copy.close },
    ]);
  };

  return { handleExportBackup, handleImport, handlePdfStatement };
}

export function DataSection() {
  const { tokens } = useTheme();
  const { handleExportBackup, handleImport, handlePdfStatement } =
    useDataActions();
  const [lastExport, setLastExportState] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const ts = await getLastExport();
      setLastExportState(ts);
    };
    void load();
  }, []);

  const lastExportText = lastExport
    ? new Date(lastExport).toLocaleString()
    : copy.lastExportNever;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontFamily: tokens.fontHeading, fontSize: 16, marginBottom: 16 }}>
        {copy.yourData}
      </Text>
      <Button onPress={handleExportBackup} accessibilityLabel="Export data">
        {copy.exportData}
      </Button>
      <Button variant="secondary" onPress={handleImport} accessibilityLabel="Import data">
        {copy.importData}
      </Button>
      <Button variant="secondary" onPress={handlePdfStatement} accessibilityLabel="PDF statement">
        {copy.monthlyPdfStatement}
      </Button>
      <Text variant="muted" style={{ marginTop: 16 }}>
        {copy.lastExportLabel} {lastExportText}
      </Text>
    </View>
  );
}
