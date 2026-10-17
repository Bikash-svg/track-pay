import { Button, StyleSheet, Text, View } from "react-native";
import {
  postTestNotification,
  requestPermission,
  scheduleTestNotification,
} from "../src/notifications/spike";

export default function SpikeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification spike</Text>
      <Button title="Allow notifications" onPress={requestPermission} />
      <Button title="Post test notification" onPress={postTestNotification} />
      <Button title="Schedule in 2 minutes" onPress={scheduleTestNotification} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
});
