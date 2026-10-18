import React, { useState } from 'react';
import { Button } from '../../src/ui/Button';
import { Field } from '../../src/ui/Field';
import { Screen } from '../../src/ui/Screen';
import { Text } from '../../src/ui/Text';
import { useDialog } from '../../src/ui/DialogProvider';
import { useTheme } from '../../src/ui/useTheme';

export default function HomeScreen() {
  const { open, close } = useDialog();
  const { theme, effectiveTheme, setTheme } = useTheme();

  // Dev-only theme trigger for Step 1.5's Done-when. Real Settings UI is
  // Step 7.2. `__DEV__` is React Native's built-in global and is false in
  // release builds, so these buttons never ship.
  if (__DEV__) {
    return (
      <Screen>
        <Text>Home</Text>
        <Text variant="muted">Built in Phase 3.</Text>
        <Text>Theme (dev): {theme} · effective {effectiveTheme}</Text>
        <Button
          variant={theme === 'dark' ? 'primary' : 'secondary'}
          accessibilityLabel="Set theme to dark (dev)"
          onPress={() => setTheme('dark')}
        >
          Dark
        </Button>
        <Button
          variant={theme === 'light' ? 'primary' : 'secondary'}
          accessibilityLabel="Set theme to light (dev)"
          onPress={() => setTheme('light')}
        >
          Light
        </Button>
        <Button
          variant={theme === 'auto' ? 'primary' : 'secondary'}
          accessibilityLabel="Set theme to auto (dev)"
          onPress={() => setTheme('auto')}
        >
          Auto
        </Button>
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