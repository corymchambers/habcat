import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, fontSize } from '@/constants/theme';
import { DayOfWeek } from '@/database';

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'mon', label: 'M' },
  { key: 'tue', label: 'T' },
  { key: 'wed', label: 'W' },
  { key: 'thu', label: 'T' },
  { key: 'fri', label: 'F' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'S' },
];

interface DaySelectorProps {
  selectedDays: DayOfWeek[] | Set<DayOfWeek>;
  onToggleDay: (day: DayOfWeek) => void;
}

export function DaySelector({ selectedDays, onToggleDay }: DaySelectorProps) {
  const isSelected = (day: DayOfWeek) => {
    if (selectedDays instanceof Set) {
      return selectedDays.has(day);
    }
    return selectedDays.includes(day);
  };

  return (
    <View style={styles.container}>
      {DAYS.map(({ key, label }) => {
        const selected = isSelected(key);
        return (
          <Pressable
            key={key}
            style={[
              styles.dayButton,
              selected && styles.dayButtonSelected,
            ]}
            onPress={() => onToggleDay(key)}
          >
            <Text
              style={[
                styles.dayText,
                selected && styles.dayTextSelected,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dayButton: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 44,
    borderRadius: 999,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  dayTextSelected: {
    color: colors.primaryForeground,
  },
});
