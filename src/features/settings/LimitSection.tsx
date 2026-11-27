import { useState, useEffect } from 'react';
import { View, TextInput, Switch, ToastAndroid } from 'react-native';
import { Text, Button } from '../../ui';
import { useTheme } from '../../ui/useTheme';
import { getLimit, setLimit } from '../../data/settings';

export function LimitSection() {
  const { tokens } = useTheme();
  const [limitOn, setLimitOn] = useState(false);
  const [limitPaise, setLimitPaise] = useState(0);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    let cancelled = false;
    getLimit().then((val) => {
      if (!cancelled && val && val > 0) {
        setLimitOn(true);
        setLimitPaise(val);
        setInputText(String(val / 100));
      }
    });
    return () => { cancelled = true; };
  }, []);

  const handleToggle = async (on: boolean) => {
    setLimitOn(on);
    if (!on) {
      setLimitPaise(0);
      setInputText('');
      await setLimit(null);
    } else {
      setLimitPaise(0);
      setInputText('0');
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);
    const paise = Math.round(parseFloat(text || '0') * 100);
    if (!isNaN(paise) && paise >= 0) {
      setLimitPaise(paise);
    }
  };

  const handleSave = async () => {
    try {
      await setLimit(limitOn ? limitPaise : null);
      ToastAndroid.show('Limit saved', ToastAndroid.SHORT);
    } catch (e) {
      ToastAndroid.show('Failed to save limit', ToastAndroid.SHORT);
    }
  };

  const quickStep = (delta: number) => {
    const newVal = Math.max(0, limitPaise + delta);
    setLimitPaise(newVal);
    setInputText(String(newVal / 100));
  };

  return (
    <View>
      <Text style={{ fontFamily: tokens.fontHeading, fontSize: 16, marginBottom: 8 }}>
        Monthly spending limit
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text>Limit per month</Text>
        <Switch value={limitOn} onValueChange={handleToggle} />
      </View>
      {limitOn && (
        <View>
          <TextInput
            value={inputText}
            onChangeText={handleInputChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={tokens.textMuted}
            style={{ color: tokens.text, fontSize: 16, padding: 8 }}
          />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Button onPress={() => quickStep(200000)}>+₹2,000</Button>
            <Button onPress={() => quickStep(500000)}>+₹5,000</Button>
            <Button onPress={() => quickStep(-100000)}>−₹1,000</Button>
          </View>
          <Text variant="muted" style={{ marginTop: 8 }}>
            Limit alerts at 80% and 100% are always on while a limit is set.
          </Text>
          <Button onPress={handleSave} style={{ marginTop: 8 }}>Save</Button>
        </View>
      )}
    </View>
  );
}
