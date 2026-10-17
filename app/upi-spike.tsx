import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";
import { listUpiApps, openUpi, type ListAppsResult, type UpiApp, type UpiResult } from "../src/native/upiLauncher";
import type { UpiListResult } from "../modules/upi-launcher/src/UpiLauncher.types";

const SHOP_QR_LINK =
  "upi://pay?pa=test@upi&pn=Test%20Shop&am=100.00&cu=INR&tn=Test%20payment";
const FRIEND_LINK = "upi://pay?pn=Friend";

export default function UpiSpikeScreen() {
  const [link, setLink] = useState(SHOP_QR_LINK);
  const [apps, setApps] = useState<UpiApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UpiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadStatus, setLoadStatus] = useState<string | null>(null);
  const [rawJson, setRawJson] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<UpiApp | null>(null);

  const formatResult = (res: UpiResult): string => {
    return JSON.stringify(
      {
        action: res.action,
        data: res.data,
        extras: res.extras,
      },
      null,
      2,
    );
  };

  const loadApps = async () => {
    setLoading(true);
    setError(null);
    setLoadStatus(null);
    setRawJson(null);
    try {
      const res = await listUpiApps();
      if (res.kind === "not-found") {
        setLoadStatus("Native module UpiLauncher not found");
        setApps([]);
        setRawJson(JSON.stringify({ kind: "not-found" }, null, 2));
      } else if (res.kind === "error") {
        setLoadStatus(`${res.code}: ${res.message}`);
        setApps([]);
        setRawJson(JSON.stringify({ kind: "error", code: res.code, message: res.message }, null, 2));
      } else {
        const r = res.result;
        const md = r.matchDefaultOnly;
        const fz = r.flagsZero;
        const raw = {
          kind: "found",
          sdkInt: r.sdkInt,
          matchDefaultOnly: { flags: md.flags, count: md.count, apps: md.apps },
          flagsZero: { flags: fz.flags, count: fz.count, apps: fz.apps },
        };
        setRawJson(JSON.stringify(raw, null, 2));
        setApps(md.apps);
        setLoadStatus(
          `SDK ${r.sdkInt} · matchDefaultOnly(${md.flags}): ${md.count} apps · flagsZero(${fz.flags}): ${fz.count} apps · apps: ${md.apps.map((a) => a.label).join(", ") || "none"}`,
        );
      }
    } catch (e) {
      const err = e as Error & { code?: string };
      setError(`${err.code ?? "UNKNOWN"}: ${err.message ?? String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const openChooser = async () => {
    setResult(null);
    setError(null);
    try {
      const res = await openUpi(link);
      setResult(res);
    } catch (e) {
      const err = e as Error & { code?: string };
      setError(`${err.code ?? "UNKNOWN"}: ${err.message ?? String(e)}`);
    }
  };

  const openWithApp = async (app: UpiApp) => {
    setSelectedApp(app);
    setResult(null);
    setError(null);
    try {
      const res = await openUpi(link, app.packageName);
      setResult(res);
    } catch (e) {
      const err = e as Error & { code?: string };
      setError(`${err.code ?? "UNKNOWN"}: ${err.message ?? String(e)}`);
    }
  };

  const openFriend = async () => {
    setResult(null);
    setError(null);
    if (!selectedApp) {
      setError("Select an installed app first.");
      return;
    }
    try {
      const res = await openUpi(FRIEND_LINK, selectedApp.packageName);
      setResult(res);
    } catch (e) {
      const err = e as Error & { code?: string };
      setError(`${err.code ?? "UNKNOWN"}: ${err.message ?? String(e)}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UPI result spike</Text>

      <View style={styles.card}>
        <Text style={styles.label}>UPI link</Text>
        <TextInput
          style={styles.input}
          value={link}
          onChangeText={setLink}
          multiline
          numberOfLines={3}
        />
        <Button title="Load installed UPI apps" onPress={loadApps} />
        {loading && <Text style={styles.muted}>Loading installed apps...</Text>}
        {error && <Text style={styles.error}>Error: {error}</Text>}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Installed UPI apps</Text>
        {loadStatus && <Text style={styles.muted}>{loadStatus}</Text>}
        {!loadStatus && loading && <Text style={styles.muted}>Loading installed apps...</Text>}
        {!loadStatus && !loading && apps.length === 0 && (
          <Text style={styles.muted}>No UPI apps found (or native module not wired).</Text>
        )}
        {apps.map((app) => (
          <View key={app.packageName} style={styles.appRow}>
            <Text style={styles.appLabel}>{app.label}</Text>
            <Text style={styles.appPackage}>{app.packageName}</Text>
            <Button
              title="Open with this app"
              onPress={() => openWithApp(app)}
            />
          </View>
        ))}
        {rawJson && (
          <Text style={styles.rawJson}>{rawJson}</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Friend case (no payee link)</Text>
        <Text style={styles.muted}>
          Opens the selected app with `upi://pay?pn=Friend` (no VPA, no amount).
        </Text>
        {!selectedApp && (
          <Text style={styles.muted}>
            Select an installed app above to enable this.
          </Text>
        )}
        <Button
          title="Open friend link with selected app"
          onPress={openFriend}
          disabled={!selectedApp}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Raw result (screen only)</Text>
        {result ? (
          <Text style={styles.result}>{formatResult(result)}</Text>
        ) : (
          <Text style={styles.muted}>No result yet.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
    padding: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    minHeight: 80,
    textAlignVertical: "top",
    marginBottom: 8,
  },
  muted: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  error: {
    fontSize: 12,
    color: "#b00",
    marginBottom: 6,
  },
  appRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    padding: 6,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  appLabel: {
    fontSize: 14,
    flex: 1,
  },
  appPackage: {
    fontSize: 11,
    color: "#666",
    flex: 2,
    marginRight: 8,
  },
  rawJson: {
    fontSize: 10,
    fontFamily: "monospace",
    color: "#333",
    marginTop: 6,
  },
  result: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#333",
  },
});
