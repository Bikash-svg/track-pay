import { View } from 'react-native';
import { Button } from '../../ui/Button';

interface ExportChoicesProps {
  readonly onBackup: () => void;
  readonly onPdf: () => void;
}

export function ExportChoices({ onBackup, onPdf }: ExportChoicesProps) {
  return (
    <View style={{ gap: 8, width: '100%' }}>
      <Button onPress={onBackup}>Backup file</Button>
      <Button variant="secondary" onPress={onPdf}>
        Monthly PDF statement
      </Button>
    </View>
  );
}
