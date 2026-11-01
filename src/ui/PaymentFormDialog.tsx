import React, { useState, useCallback, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Field } from './Field';
import { AmountField } from './AmountField';
import { Button } from './Button';
import { Chip } from './Chip';
import { Text } from './Text';
import { Card } from './Card';
import type { Payment, PaymentInput } from '../data/payments';
import { useTheme } from './useTheme';
import { copy } from './copy';
import { validateAmount, validatePayee, validatePaidAt, CATEGORIES, type PaymentCategory } from '../domain/paymentForm';
import { formatPaise } from '../domain/amount';

export type PaymentFormDialogProps = {
  readonly mode: 'add' | 'edit';
  readonly initial?: Payment;
  readonly onSaved: (input: PaymentInput) => void | Promise<void>;
  readonly onCancel: () => void;
};

// Date utility functions
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const parseDateFromInput = (input: string): Date => {
  const now = new Date();
  const match = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}))?$/);
  if (!match) return now;
  const [_, yearStr, monthStr, dayStr, hourStr, minuteStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const hours = hourStr ? parseInt(hourStr, 10) : 0;
  const minutes = minuteStr ? parseInt(minuteStr, 10) : 0;
  return new Date(year, month, day, hours, minutes);
};

export function PaymentFormDialog({ mode, initial, onSaved, onCancel }: PaymentFormDialogProps) {
  const { tokens } = useTheme();
  
  // State for form fields
  const [amount, setAmount] = useState(() => {
    if (mode === 'edit' && initial) {
      return formatPaise(initial.amountPaise);
    }
    return formatPaise(0);
  });
  
  const [payeeName, setPayeeName] = useState(() => {
    if (mode === 'edit' && initial) {
      return initial.payeeName;
    }
    return '';
  });
  
  const [label, setLabel] = useState(() => {
    if (mode === 'edit' && initial) {
      return initial.label ?? '';
    }
    return '';
  });
  
  const [category, setCategory] = useState<PaymentCategory>(() => {
    if (mode === 'edit' && initial) {
      return initial.category as PaymentCategory;
    }
    return 'Other';
  });
  
  const [dateInput, setDateInput] = useState(() => {
    if (mode === 'edit' && initial) {
      return formatDateForInput(new Date(initial.createdAt));
    }
    return formatDateForInput(new Date());
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerDate, setPickerDate] = useState(() => parseDateFromInput(dateInput));
  
  const [amountError, setAmountError] = useState('');
  const [payeeError, setPayeeError] = useState('');
  const [labelError, setLabelError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [dateError, setDateError] = useState('');
  
  // Validation functions
  const validatedAmount = useMemo(() => {
    const result = validateAmount(amount);
    if (result.ok) {
      setAmountError('');
    } else {
      const errorMsg = result.errors[0].message;
      setAmountError(errorMsg);
    }
    return result;
  }, [amount]);
  
  const validatedPayee = useMemo(() => {
    const result = validatePayee(payeeName);
    if (result.ok) {
      setPayeeError('');
    } else {
      const errorMsg = result.errors[0].message;
      setPayeeError(errorMsg);
    }
    return result;
  }, [payeeName]);
  
  const validatedDate = useMemo(() => {
    const parsedDate = parseDateFromInput(dateInput);
    const now = new Date();
    const result = validatePaidAt(parsedDate, now);
    if (result.ok) {
      setDateError('');
    } else {
      const errorMsg = result.errors[0].message;
      setDateError(errorMsg);
    }
    return result;
  }, [dateInput]);
  
  const isValid = useMemo(() => {
    return validatedAmount.ok && 
           validatedPayee.ok && 
           !dateError &&
           category !== undefined;
  }, [validatedAmount, validatedPayee, dateError, category]);
  
  const handleSave = useCallback(async () => {
    if (!isValid || !validatedAmount.ok || !validatedPayee.ok) return;
    
    const parsedDate = parseDateFromInput(dateInput);
    
    const input = {
      amountPaise: validatedAmount.value,
      payeeName: validatedPayee.value,
      label: label || null,
      category,
      createdAt: parsedDate,
      source: 'manual' as const,
      reviewed: true,
    };
    
    await onSaved(input);
  }, [
    isValid, validatedAmount, validatedPayee, label, category, dateInput,
    onSaved,
  ]);
  
  const openDatePicker = () => {
    setPickerDate(parseDateFromInput(dateInput));
    setShowDatePicker(true);
  };

  const onDateChange = (event: DateTimePickerEvent, picked?: Date) => {
    setShowDatePicker(false);
    if (event.type !== 'set' || !picked) return;
    const merged = new Date(pickerDate);
    merged.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
    setPickerDate(merged);
    setShowTimePicker(true);
  };

  const onTimeChange = (event: DateTimePickerEvent, picked?: Date) => {
    setShowTimePicker(false);
    if (event.type !== 'set' || !picked) return;
    const merged = new Date(pickerDate);
    merged.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
    setPickerDate(merged);
    setDateInput(formatDateForInput(merged));
  };
  
  return (
    <Card style={{ padding: 16, margin: 16, maxWidth: 500, alignSelf: 'center' }}>
      <Text variant="secondary" style={{ marginBottom: 16, fontSize: 18 }}>
        {mode === 'add' ? 'Add Payment' : 'Edit Payment'}
      </Text>
      
      <Text variant="muted" style={{ marginBottom: 8 }}>{copy.amount}</Text>
      <AmountField
        value={amount}
        onChangeText={setAmount}
        error={amountError}
      />
      
      <Text variant="muted" style={{ marginBottom: 8 }}>{copy.toWhom}</Text>
      <Field
        label={copy.toWhom}
        value={payeeName}
        onChangeText={setPayeeName}
        error={payeeError}
        accessibilityLabel={copy.toWhom}
      />
      
      <Text variant="muted" style={{ marginBottom: 8 }}>{copy.whatWasThisFor}</Text>
      <Field
        label={copy.whatWasThisFor}
        value={label}
        onChangeText={setLabel}
        error={labelError}
        accessibilityLabel={copy.whatWasThisFor}
      />
      
      <Text variant="muted" style={{ marginBottom: 8 }}>{copy.category}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            selected={category === cat}
            onPress={() => setCategory(cat)}
          >
            {cat}
          </Chip>
        ))}
      </View>
      
      <Text variant="muted" style={{ marginBottom: 8 }}>{copy.date}</Text>
      <View style={{ marginBottom: 16 }}>
        <Pressable
          onPress={openDatePicker}
          accessibilityRole="button"
          accessibilityLabel={`${copy.date}: ${dateInput}. Tap to change.`}
          style={{
            minHeight: 44,
            justifyContent: 'center',
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderWidth: 1,
            borderColor: tokens.border,
            borderRadius: 8,
            backgroundColor: tokens.interactive,
          }}
        >
          <Text variant="secondary">{copy.date}</Text>
          <Text>{dateInput}</Text>
        </Pressable>
        {dateError && <Text variant="muted">{dateError}</Text>}
      </View>
      {showDatePicker && (
        <DateTimePicker
          value={pickerDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      {showTimePicker && (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          display="default"
          is24Hour
          onChange={onTimeChange}
        />
      )}
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
        <Button
          variant="secondary"
          onPress={onCancel}
          accessibilityLabel={copy.cancel}
        >
          {copy.cancel}
        </Button>
        
        <Button
          variant="primary"
          onPress={handleSave}
          disabled={!isValid}
          accessibilityLabel={mode === 'add' ? copy.save : copy.saveChanges}
        >
          {mode === 'add' ? copy.save : copy.saveChanges}
        </Button>
      </View>
    </Card>
  );
}

