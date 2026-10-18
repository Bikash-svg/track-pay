import React, { useState } from 'react';
import { Button } from '../../src/ui/Button';
import { Field } from '../../src/ui/Field';
import { Screen } from '../../src/ui/Screen';
import { Text } from '../../src/ui/Text';
import { useDialog } from '../../src/ui/DialogProvider';

export default function HomeScreen() {
  const { open, close } = useDialog();

  // Dev-only trigger for Step 1.4's device check. `__DEV__` is React
  // Native's built-in global (declared in react-native/src/types/globals.d.ts)
  // and is false in release builds, so this button never ships.
  if (__DEV__) {
    return (
      <Screen>
        <Text>Home</Text>
        <Text variant="muted">Built in Phase 3.</Text>
        <Button
          accessibilityLabel="Show dialog (dev)"
          onPress={() =>
            open({
              title: 'Dialog (dev)',
              subtitle:
                'Centred on small and large phones with the keyboard open.',
              children: <DevTextField />,
              primaryAction: (
                <Button variant="primary" onPress={close}>
                  OK
                </Button>
              ),
            })
          }
        >
          Show dialog (dev)
        </Button>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text>Home</Text>
      <Text variant="muted">Built in Phase 3.</Text>
    </Screen>
  );
}

// Dev harness only. A text field so the soft keyboard opens inside the dialog
// and the Done-when "with the keyboard open" can be checked on a phone. It is
// not a Phase 4 dialog — no content, no storage, no behaviour.
function DevTextField() {
  const [text, setText] = useState('');
  return (
    <Field
      label="Type here (dev)"
      value={text}
      onChangeText={setText}
      accessibilityLabel="Dev text field"
    />
  );
}