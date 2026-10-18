import React from 'react';
import { ScrollView, View } from 'react-native';
import {
  Banner,
  Button,
  Card,
  Chip,
  Field,
  Money,
  PayRow,
  Screen,
  StatusTag,
  Text,
  Toggle,
  useTheme,
} from './index';

export function PrimitivesDemo() {
  const { tokens, setTheme } = useTheme();
  return (
    <Screen>
      <ScrollView>
        <Card>
          <Text>Text default</Text>
          <Text variant="secondary">Text secondary</Text>
          <Text variant="muted">Text muted</Text>
          <Money paise={12345} />
          <Chip>Chip</Chip>
          <StatusTag status="Done" />
          <StatusTag status="Failed" />
          <StatusTag status="Pending" />
          <Banner>{`Banner — ${tokens.text}`}</Banner>
          <Toggle value={false} onValueChange={() => {}} accessibilityLabel="toggle" />
          <PayRow avatarLetter="T" name="Friend" amountPaise={6000} status="Done" date="Today" />
          <Field label="To whom" value="" onChangeText={() => {}} />
          <Button variant="primary" onPress={() => setTheme('light')}>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="text">Text button</Button>
        </Card>
      </ScrollView>
    </Screen>
  );
}
