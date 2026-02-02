import { CatMascot } from '@/components/CatMascot';
import { borderRadius, colors, fontSize, spacing } from '@/constants/theme';
import {
  DayDetail,
  formatDate,
  getCompletionStats,
  getHistoryData,
  getStreaks,
  parseLocalDate,
  StreakData,
} from '@/database';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FilterPeriod = 'week' | 'month' | 'year' | 'custom';

export default function HistoryScreen() {
  const [period, setPeriod] = useState<FilterPeriod>('week');
  const [historyData, setHistoryData] = useState<DayDetail[]>([]);
  const [streaks, setStreaks] = useState<StreakData>({
    current: 0,
    longest: 0,
  });
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Custom date range
  const [customStartDate, setCustomStartDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  });
  const [customEndDate, setCustomEndDate] = useState<Date>(new Date());

  // Date picker visibility
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Temp date for picker (so we can cancel)
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const today = useMemo(() => new Date(), []);

  const { startDate, endDate } = useMemo(() => {
    const end = new Date(today);
    const start = new Date(today);

    if (period === 'week') {
      start.setDate(end.getDate() - 6);
    } else if (period === 'month') {
      start.setDate(end.getDate() - 29);
    } else if (period === 'year') {
      start.setFullYear(end.getFullYear() - 1);
    } else {
      return {
        startDate: formatDate(customStartDate),
        endDate: formatDate(customEndDate),
      };
    }

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  }, [period, today, customStartDate, customEndDate]);

  useFocusEffect(
    useCallback(() => {
      setHistoryData(getHistoryData(startDate, endDate));
      setStreaks(getStreaks());
    }, [startDate, endDate]),
  );

  const stats = useMemo(() => {
    return getCompletionStats(startDate, endDate);
  }, [startDate, endDate]);

  const toggleExpanded = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = parseLocalDate(dateStr);
    const todayStr = formatDate(today);
    const yesterdayDate = new Date(today);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = formatDate(yesterdayDate);

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const openStartPicker = () => {
    setTempDate(customStartDate);
    setShowStartPicker(true);
  };

  const openEndPicker = () => {
    setTempDate(customEndDate);
    setShowEndPicker(true);
  };

  const handlePickerChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === 'android') {
      // Android dialog auto-dismisses
      if (showStartPicker) {
        setShowStartPicker(false);
        if (selectedDate) setCustomStartDate(selectedDate);
      } else {
        setShowEndPicker(false);
        if (selectedDate) setCustomEndDate(selectedDate);
      }
    } else if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const handlePickerDone = () => {
    if (showStartPicker) {
      setCustomStartDate(tempDate);
      setShowStartPicker(false);
    } else {
      setCustomEndDate(tempDate);
      setShowEndPicker(false);
    }
  };

  const handlePickerCancel = () => {
    setShowStartPicker(false);
    setShowEndPicker(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Your journey so far</Text>
        </View>
        <CatMascot variant="sitting" size="lg" />
      </View>

      {/* Streak cards */}
      <View style={styles.streakContainer}>
        <View style={styles.streakCard}>
          <Ionicons name="flame" size={24} color={colors.primary} />
          <Text style={styles.streakValue}>{streaks.current}</Text>
          <Text style={styles.streakLabel}>Current streak</Text>
        </View>
        <View style={styles.streakCard}>
          <Ionicons name="trophy" size={24} color={colors.primary} />
          <Text style={styles.streakValue}>{streaks.longest}</Text>
          <Text style={styles.streakLabel}>Longest streak</Text>
        </View>
      </View>

      {/* Period filter */}
      <View style={styles.filterContainer}>
        {(['week', 'month', 'year', 'custom'] as FilterPeriod[]).map((p) => (
          <Pressable
            key={p}
            style={[
              styles.filterButton,
              period === p && styles.filterButtonActive,
            ]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[
                styles.filterText,
                period === p && styles.filterTextActive,
              ]}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Custom date range pickers */}
      {period === 'custom' && (
        <View style={styles.customDateContainer}>
          <Pressable style={styles.datePickerField} onPress={openStartPicker}>
            <Text style={styles.datePickerLabel}>From</Text>
            <Text style={styles.datePickerValue}>
              {customStartDate.toLocaleDateString()}
            </Text>
          </Pressable>
          <Pressable style={styles.datePickerField} onPress={openEndPicker}>
            <Text style={styles.datePickerLabel}>To</Text>
            <Text style={styles.datePickerValue}>
              {customEndDate.toLocaleDateString()}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Date picker modal (iOS) / dialog (Android) */}
      {Platform.OS === 'ios' && (showStartPicker || showEndPicker) && (
        <Modal transparent animationType="slide">
          <Pressable style={styles.pickerOverlay} onPress={handlePickerCancel}>
            <Pressable style={styles.pickerContainer} onPress={() => {}}>
              <View style={styles.pickerHandle} />
              <View style={styles.pickerHeader}>
                <Pressable onPress={handlePickerCancel} hitSlop={8}>
                  <Text style={styles.pickerCancelText}>Cancel</Text>
                </Pressable>
                <Text style={styles.pickerTitle}>
                  Select {showStartPicker ? 'start' : 'end'} date
                </Text>
                <Pressable onPress={handlePickerDone} hitSlop={8}>
                  <Text style={styles.pickerDoneText}>Done</Text>
                </Pressable>
              </View>
              <View style={styles.pickerBody}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="inline"
                  onChange={handlePickerChange}
                  maximumDate={showStartPicker ? customEndDate : today}
                  minimumDate={showEndPicker ? customStartDate : undefined}
                  accentColor={colors.primary}
                  style={styles.inlinePicker}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {Platform.OS === 'android' && showStartPicker && (
        <DateTimePicker
          value={customStartDate}
          mode="date"
          display="default"
          onChange={handlePickerChange}
          maximumDate={customEndDate}
        />
      )}

      {Platform.OS === 'android' && showEndPicker && (
        <DateTimePicker
          value={customEndDate}
          mode="date"
          display="default"
          onChange={handlePickerChange}
          minimumDate={customStartDate}
          maximumDate={today}
        />
      )}

      <ScrollView style={styles.content}>
        {/* Stats card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Completion</Text>
            <Text style={styles.statValue}>{stats.percentage}%</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Habits done</Text>
            <Text style={styles.statValue}>
              {stats.completed} / {stats.expected}
            </Text>
          </View>
        </View>

        {/* History list */}
        <View style={styles.historyList}>
          {historyData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No history yet</Text>
              <Text style={styles.emptySubtext}>
                Complete habits to see your progress
              </Text>
            </View>
          ) : (
            historyData.map((day) => {
              const isExpanded = expandedDates.has(day.date);
              const isComplete = day.completed === day.total;
              const hasData = day.total > 0;

              return (
                <View key={day.date}>
                  <Pressable
                    style={styles.dayRow}
                    onPress={
                      hasData ? () => toggleExpanded(day.date) : undefined
                    }
                    disabled={!hasData}
                  >
                    <View style={styles.dayInfo}>
                      <Text style={styles.dayDate}>
                        {formatDisplayDate(day.date)}
                      </Text>
                    </View>
                    {hasData ? (
                      <View style={styles.dayStats}>
                        <Text
                          style={[
                            styles.dayCount,
                            isComplete && styles.dayCountComplete,
                          ]}
                        >
                          {day.completed}/{day.total}
                        </Text>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color={colors.mutedForeground}
                        />
                      </View>
                    ) : (
                      <Text style={styles.noDataText}>No data</Text>
                    )}
                  </Pressable>

                  {hasData && isExpanded && (
                    <View style={styles.expandedContent}>
                      {day.habits.map((habit) => (
                        <View key={habit.id} style={styles.habitRow}>
                          <Ionicons
                            name={
                              habit.completed
                                ? 'checkmark-circle'
                                : 'ellipse-outline'
                            }
                            size={20}
                            color={
                              habit.completed
                                ? colors.success
                                : colors.habitBorder
                            }
                          />
                          <Text
                            style={[
                              styles.habitName,
                              habit.completed && styles.habitNameCompleted,
                            ]}
                          >
                            {habit.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.foreground,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  mascotPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.muted,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.secondaryForeground,
  },
  filterTextActive: {
    color: colors.primaryForeground,
  },
  customDateContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  datePickerField: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePickerLabel: {
    fontSize: fontSize.xs,
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
  },
  datePickerValue: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.primary,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  pickerHandle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.muted,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  pickerBody: {
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  inlinePicker: {
    width: '100%',
    height: 350,
  },
  pickerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.foreground,
  },
  pickerCancelText: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  pickerDoneText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  streakContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  streakCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: spacing.xs,
  },
  streakLabel: {
    fontSize: fontSize.xs,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {},
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.foreground,
  },
  historyList: {
    marginBottom: spacing.xl,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayInfo: {
    flex: 1,
  },
  dayDate: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.foreground,
  },
  dayStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dayCount: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  dayCountComplete: {
    color: colors.success,
  },
  noDataText: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    fontStyle: 'italic',
  },
  expandedContent: {
    backgroundColor: colors.muted,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  habitName: {
    fontSize: fontSize.sm,
    color: colors.foreground,
  },
  habitNameCompleted: {
    color: colors.mutedForeground,
    textDecorationLine: 'line-through',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.foreground,
  },
  emptySubtext: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
    marginTop: spacing.sm,
  },
});
