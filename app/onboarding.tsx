import React, { useState } from 'react';
import { router } from 'expo-router';
import { setProfile } from '../src/data/settings';
import { greeting } from '../src/domain/greeting';
import { sanitizeName } from '../src/domain/profile';
import { copy } from '../src/ui/copy';
import { Button } from '../src/ui/Button';
import { Card } from '../src/ui/Card';
import { Field } from '../src/ui/Field';
import { Screen } from '../src/ui/Screen';
import { Text } from '../src/ui/Text';

// Onboarding step 1 of 2 (single-step per 4a iii). Saves the profile then
// router.replace('/') to land on the Home tab. /onboarding is auto-routed
// by Expo Router; no Stack.Screen entry here (2.4 adds the launch branch).
// The target is the tab-group root, not '/home': the old app/index.tsx
// redirect was removed in Step 1.3, and this expo-router build's generated
// typed routes (`.expo/types/router.d.ts`) list the Home tab as
// `${'/(tabs)'} | /` — there is no '/home' or '/(tabs)/index' route, so
// '/home' does not typecheck against its allowed-route union.
//
// No pre-fill: 2.3 starts blank. Re-entry with pre-filled fields is 7.1's
// Edit profile. No avatar circle — that is DESIGN-BUILD-PLAN D4.2's visual.
// No "Step 1 of 2" label — step 2 (monthly limit) is deferred to 7.3.

export default function OnboardingScreen() {
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [saving, setSaving] = useState(false);

  // Live preview only. Does not save until Continue is tapped. Only the
  // first name reaches greeting(); the surname is stored but not shown here,
  // matching COPY.md's "Good morning, {First name}".
  const previewText = greeting(new Date(), sanitizeName(firstName));

  const handleSkip = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await setProfile({
        firstName: null,
        surname: null,
        avatarUri: null,
        onboarded: true,
        preferredUpiPackage: null,
      });
      router.replace('/');
    } catch (err) {
      if (__DEV__) console.warn('onboarding skip failed', err);
      setSaving(false); // stay on screen, user can retry
    }
  };

  const handleContinue = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await setProfile({
        firstName: sanitizeName(firstName),
        surname: sanitizeName(surname),
        avatarUri: null,
        onboarded: true,
        preferredUpiPackage: null,
      });
      router.replace('/');
    } catch (err) {
      if (__DEV__) console.warn('onboarding continue failed', err);
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Button
        variant="text"
        onPress={handleSkip}
        disabled={saving}
        accessibilityLabel={copy.skipForNow}
      >
        {copy.skipForNow}
      </Button>
      <Field
        label={copy.firstName}
        value={firstName}
        onChangeText={setFirstName}
        accessibilityLabel={copy.firstName}
      />
      <Field
        label={copy.surname}
        value={surname}
        onChangeText={setSurname}
        accessibilityLabel={copy.surname}
      />
      <Card>
        <Text>{previewText}</Text>
      </Card>
      <Button
        variant="primary"
        onPress={handleContinue}
        disabled={saving}
        accessibilityLabel={copy.continueLabel}
      >
        {copy.continueLabel}
      </Button>
    </Screen>
  );
}