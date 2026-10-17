import { Button, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import {
  postTestNotification,
  requestPermission,
  scheduleTestNotification,
} from "../src/notifications/spike";

export default function Index() {
  const [result, setResult] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification spike</Text>
      <Button
        title="Allow notifications"
        onPress={async () => {
          const settings = await requestPermission();
          setResult(
            settings.authorizationStatus === 1
              ? "Notifications authorized"
              : "Notifications not authorized",
          );
        }}
      />
      {result && <Text style={styles.result}>{result}</Text>}
      <Button title="Post test notification" onPress={postTestNotification} />
      <Button
        title="Schedule in 2 minutes"
        onPress={scheduleTestNotification}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
  result: {
    fontSize: 14,
    marginTop: 6,
  },
});
