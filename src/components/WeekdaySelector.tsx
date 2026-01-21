import { AppButton } from '@/components/AppButton';
import { AppList } from '@/components/AppList';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { LegendListRenderItemProps } from '@legendapp/list';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sun ... 6 = Sat

// Bitmask values: Sunday=1, Monday=2, Tuesday=4, Wednesday=8, Thursday=16, Friday=32, Saturday=64
const DAY_TO_BITMASK: Record<WeekdayIndex, number> = {
  0: 1, // Sunday
  1: 2, // Monday
  2: 4, // Tuesday
  3: 8, // Wednesday
  4: 16, // Thursday
  5: 32, // Friday
  6: 64, // Saturday
};

type WeekdaySelectorProps = {
  value?: number; // Bitmask value
  onDaysChanged?: (_bitmask: number) => void;
  allowEmpty?: boolean;
  fullNames?: boolean;
  disabled?: boolean;
};

const SHORT_DAY_LABELS: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const FULL_DAY_LABELS: string[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// Convert bitmask to array of WeekdayIndex
const bitmaskToDays = (bitmask: number): WeekdayIndex[] => {
  const days: WeekdayIndex[] = [];
  for (let i = 0; i <= 6; i++) {
    const dayIndex = i as WeekdayIndex;
    if (bitmask & DAY_TO_BITMASK[dayIndex]) {
      days.push(dayIndex);
    }
  }
  return days;
};

// Convert array of WeekdayIndex to bitmask
const daysToBitmask = (days: WeekdayIndex[]): number => {
  return days.reduce((mask, day) => mask | DAY_TO_BITMASK[day], 0 as number);
};

export const WeekdaySelector = ({
  value,
  onDaysChanged,
  allowEmpty = true,
  fullNames = false,
  disabled = false,
}: WeekdaySelectorProps) => {
  const [selectedDays, setSelectedDays] = useState<WeekdayIndex[]>(
    value ? bitmaskToDays(value) : [],
  );

  useEffect(() => {
    const newDays = value ? bitmaskToDays(value) : [];
    setSelectedDays(newDays);
  }, [value]);

  useEffect(() => {
    const bitmask = daysToBitmask(selectedDays);
    onDaysChanged?.(bitmask);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDays]);

  const labels = useMemo(
    () => (fullNames ? FULL_DAY_LABELS : SHORT_DAY_LABELS),
    [fullNames],
  );

  const isSelected = useCallback(
    (index: WeekdayIndex) => selectedDays.includes(index),
    [selectedDays],
  );

  const toggleDay = useCallback(
    (index: WeekdayIndex) => {
      if (disabled) return;

      setSelectedDays((prev) => {
        const currentlySelected = prev.includes(index);
        if (currentlySelected) {
          const next = prev.filter((d) => d !== index) as WeekdayIndex[];
          if (!allowEmpty && next.length === 0) return prev;
          return next;
        }
        const next = [...prev, index].sort((a, b) => a - b) as WeekdayIndex[];
        return next;
      });
    },
    [allowEmpty, disabled],
  );

  const renderItem = ({
    item: label,
    index,
  }: LegendListRenderItemProps<(typeof labels)[number]>) => {
    const active = isSelected(index as WeekdayIndex);
    return (
      <AppButton
        marginR-16
        key={label}
        disabled={disabled}
        onPress={() => toggleDay(index as WeekdayIndex)}>
        <AppView
          width={28}
          height={28}
          center
          br20
          bg-primary
          style={{
            opacity: active ? 1 : 0.5,
          }}>
          <AppText textOnPrimary tabLabel>
            {label}
          </AppText>
        </AppView>
      </AppButton>
    );
  };

  return (
    <AppView>
      <TranslatedText marginB-8 translationKey="tabs.create_tab.repeats_on" />
      <AppList
        data={labels}
        renderItem={renderItem}
        extraData={selectedDays}
        horizontal
        scrollEnabled={false}
        keyExtractor={(i, index) => i + index}
      />
    </AppView>
  );
};
