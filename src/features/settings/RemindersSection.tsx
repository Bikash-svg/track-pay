import { useState, useEffect } from 'react';
import {
  View,
  Switch,
  Linking,
  Platform,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, Button, copy } from '../../ui';
import { useTheme } from '../../ui/useTheme';
import {
  getReminderTimes,
  setReminderTimes,
  getQuietHours,
  setQuietHours,
  getLockScreenDetails,
  setLockScreenDetails,
  getBackupReminder,
  setBackupReminder,
} from '../../data/settings';

const MAX_TIMES = 6;
const TIME_REGEX = /^([01]?\d|2[0-3]):[0-5]\d$/;
const DEFAULT_TIMES = ['10:00', '14:00', '18:00', '21:00'];

export function RemindersSection() {
  const { tokens } = useTheme();
  const [remindersOn, setRemindersOn] = useState(true);
  const [reminderTimes, setReminderTimesState] = useState<string[]>([]);
  const [quietFrom, setQuietFrom] = useState('');
  const [quietTo, setQuietTo] = useState('');
  const [lockScreenOn, setLockScreenOn] = useState(false);
  const [backupReminderOn, setBackupReminderOn] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(new Date());
  const [showQuietFromPicker, setShowQuietFromPicker] = useState(false);
  const [quietFromDate, setQuietFromDate] = useState(new Date());
  const [showQuietToPicker, setShowQuietToPicker] = useState(false);
  const [quietToDate, setQuietToDate] = useState(new Date());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [times, qh, lock, backup] = await Promise.all([
        getReminderTimes(),
        getQuietHours(),
        getLockScreenDetails(),
        getBackupReminder(),
      ]);
      if (!cancelled) {
        setReminderTimesState(times);
        setQuietFrom(qh.from);
        setQuietTo(qh.to);
        setLockScreenOn(lock);
        setBackupReminderOn(backup);
        setRemindersOn(times.length > 0);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggleReminders = async (on: boolean) => {
    setRemindersOn(on);
    if (on && reminderTimes.length === 0) {
      setReminderTimesState(DEFAULT_TIMES);
      await setReminderTimes(DEFAULT_TIMES);
    } else if (!on) {
      setReminderTimesState([]);
      await setReminderTimes([]);
    }
  };

  const handleAddTime = async () => {
    setPickerDate(new Date());
    setShowTimePicker(true);
  };

  const handleTimePickerChange = async (_event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      const time = `${hours}:${minutes}`;
      if (TIME_REGEX.test(time) && !reminderTimes.includes(time) && reminderTimes.length < MAX_TIMES) {
        const next = [...reminderTimes, time].sort();
        setReminderTimesState(next);
        await setReminderTimes(next);
      }
    }
  };

  const handleQuietFromPickerChange = async (_event: any, selectedDate?: Date) => {
    setShowQuietFromPicker(false);
    if (selectedDate) {
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      const time = `${hours}:${minutes}`;
      setQuietFrom(time);
      await setQuietHours({ from: time, to: quietTo });
    }
  };

  const handleQuietToPickerChange = async (_event: any, selectedDate?: Date) => {
    setShowQuietToPicker(false);
    if (selectedDate) {
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      const time = `${hours}:${minutes}`;
      setQuietTo(time);
      await setQuietHours({ from: quietFrom, to: time });
    }
  };

  const handleRemoveTime = async (time: string) => {
    const next = reminderTimes.filter((t) => t !== time);
    setReminderTimesState(next);
    await setReminderTimes(next);
    if (next.length === 0) {
      setRemindersOn(false);
    }
  };

  const handleToggleLockScreen = async (on: boolean) => {
    setLockScreenOn(on);
    await setLockScreenDetails(on);
  };

  const handleToggleBackupReminder = async (on: boolean) => {
    setBackupReminderOn(on);
    await setBackupReminder(on);
  };

  const handleOpenBatterySettings = async () => {
    if (Platform.OS === 'android') {
      try {
        await Linking.openSettings();
      } catch {
        // Ignore: battery settings shortcut is best-effort.
      }
    }
  };

  const quietRowStyle: object = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View>
          <Text style={{ fontFamily: tokens.fontHeading, fontSize: 16, marginBottom: 8 }}>
            {copy.dailyReminders}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Text>{copy.dailyReminders}</Text>
            <Switch value={remindersOn} onValueChange={handleToggleReminders} />
          </View>
          {remindersOn && (
            <View>
              <Text variant="secondary">{copy.reminderTimes}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {reminderTimes.map((time) => (
                  <Pressable
                    key={time}
                    onPress={() => handleRemoveTime(time)}
                    accessibilityLabel={`${time} ${copy.remove}`}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: tokens.interactive,
                      borderColor: tokens.border,
                      borderWidth: 1,
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                    }}
                  >
                    <Text style={{ color: tokens.text, fontSize: 14 }}>{time}</Text>
                    <Text style={{ color: tokens.text, fontSize: 14, marginLeft: 6 }}>
                      {copy.remove}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Button
                onPress={handleAddTime}
                accessibilityLabel={copy.addTime}
              >
                {copy.addTime}
              </Button>
              {showTimePicker && (
                <DateTimePicker
                  value={pickerDate}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleTimePickerChange}
                />
              )}
              <Text variant="muted" style={{ marginBottom: 8 }}>
                {copy.quietHoursDescription}
              </Text>
              <View style={quietRowStyle}>
                <Pressable
                  onPress={() => {
                    setQuietFromDate(new Date());
                    setShowQuietFromPicker(true);
                  }}
                  accessibilityLabel={`Quiet hours from ${quietFrom || '23:00'}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: tokens.interactive,
                    borderColor: tokens.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    minWidth: 70,
                  }}
                >
                  <Text style={{ color: tokens.text, fontSize: 14 }}>
                    {quietFrom || '23:00'}
                  </Text>
                </Pressable>
                <Text style={{ color: tokens.text, fontSize: 14 }}>to</Text>
                <Pressable
                  onPress={() => {
                    setQuietToDate(new Date());
                    setShowQuietToPicker(true);
                  }}
                  accessibilityLabel={`Quiet hours to ${quietTo || '07:00'}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: tokens.interactive,
                    borderColor: tokens.border,
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    minWidth: 70,
                  }}
                >
                  <Text style={{ color: tokens.text, fontSize: 14 }}>
                    {quietTo || '07:00'}
                  </Text>
                </Pressable>
              </View>
              {showQuietFromPicker && (
                <DateTimePicker
                  value={quietFromDate}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleQuietFromPickerChange}
                />
              )}
              {showQuietToPicker && (
                <DateTimePicker
                  value={quietToDate}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={handleQuietToPickerChange}
                />
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text>{copy.lockScreenDetails}</Text>
                <Switch value={lockScreenOn} onValueChange={handleToggleLockScreen} />
              </View>
              <Text variant="muted" style={{ marginBottom: 8 }}>
                {copy.lockScreenDetailsOff}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text>{copy.backupReminder}</Text>
                <Switch value={backupReminderOn} onValueChange={handleToggleBackupReminder} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text>{copy.limitAlertsAlwaysOn}</Text>
              </View>
              <Button onPress={handleOpenBatterySettings} accessibilityLabel={copy.batterySettings}>
                {copy.batterySettings}
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
