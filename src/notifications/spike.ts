import { Notification } from "react-native-notify-kit";
import notifee, {
  AndroidImportance,
  EventType,
  TriggerType,
} from "react-native-notify-kit";

const CHANNEL_ID = "tp-spike-channel";
const TEST_NOTIFICATION_ID = "tp-spike-test";
const RESULT_NOTIFICATION_ID = "tp-spike-result";

const TEST_NOTIFICATION: Notification = {
  id: TEST_NOTIFICATION_ID,
  title: "Payment to Test Person",
  body: "₹60 · Saved as pending",
  android: {
    channelId: CHANNEL_ID,
    actions: [
      {
        pressAction: { id: "done" },
        title: "Done",
      },
      {
        pressAction: { id: "failed" },
        title: "Failed",
      },
      {
        pressAction: { id: "reply" },
        title: "Name this payment",
        input: true,
      },
    ],
  },
};

// Background event handler registered at module top level. It runs when the
// app is closed or killed because the native side loads the JS bundle and
// evaluates this module before dispatching action-press events to it.
notifee.onBackgroundEvent(async (event) => {
  if (event.type !== EventType.ACTION_PRESS) return;
  const { pressAction, input } = event.detail;
  const id = pressAction?.id;

  if (id === "done") {
    await notifee.displayNotification({
      id: RESULT_NOTIFICATION_ID,
      title: "Marked Done (background)",
      android: { channelId: CHANNEL_ID },
    });
    return;
  }

  if (id === "failed") {
    await notifee.displayNotification({
      id: RESULT_NOTIFICATION_ID,
      title: "Marked Failed (background)",
      android: { channelId: CHANNEL_ID },
    });
    return;
  }

  if (id === "reply") {
    await notifee.displayNotification({
      id: RESULT_NOTIFICATION_ID,
      title: `Name saved: ${input ?? ""}`,
      android: { channelId: CHANNEL_ID },
    });
    return;
  }
});

async function ensureChannel(): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: "Track Pay Spike",
    importance: AndroidImportance.HIGH,
  });
}

export async function requestPermission() {
  await ensureChannel();
  return notifee.requestPermission();
}

export async function postTestNotification() {
  await ensureChannel();
  return notifee.displayNotification(TEST_NOTIFICATION);
}

export async function scheduleTestNotification() {
  await ensureChannel();
  const trigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: Date.now() + 2 * 60 * 1000,
  } as const;
  return notifee.createTriggerNotification(TEST_NOTIFICATION, trigger);
}
