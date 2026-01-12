import { AppButton } from '@/components/AppButton';
import { AppList } from '@/components/AppList';
import { Divider } from '@/components/Divider';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { LegendListRenderItemProps } from '@legendapp/list';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sun ... 6 = Sat

type WeekdaySelectorProps = {
  value?: WeekdayIndex[];
  onDaysChanged?: (_days: WeekdayIndex[]) => void;
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

export const WeekdaySelector = ({
  value,
  onDaysChanged,
  allowEmpty = true,
  fullNames = false,
  disabled = false,
}: WeekdaySelectorProps) => {
  const [selected, setSelected] = useState<WeekdayIndex[]>(value ?? []);

  const valueSignature = useMemo(
    () => (Array.isArray(value) ? value.join(',') : ''),
    [value],
  );

  useEffect(() => {
    if (Array.isArray(valueSignature)) {
      setSelected(valueSignature);
    }
  }, [valueSignature]);

  useEffect(() => {
    onDaysChanged?.(selected);
  }, [selected, onDaysChanged]);

  const labels = useMemo(
    () => (fullNames ? FULL_DAY_LABELS : SHORT_DAY_LABELS),
    [fullNames],
  );

  const isSelected = useCallback(
    (index: WeekdayIndex) => selected.includes(index),
    [selected],
  );

  const toggleDay = useCallback(
    (index: WeekdayIndex) => {
      if (disabled) return;

      setSelected((prev) => {
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
      <TranslatedText translationKey="tabs.create_tab.repeats_on" />
      <Divider />
      <AppList
        data={labels}
        renderItem={renderItem}
        extraData={selected}
        horizontal
        scrollEnabled={false}
        keyExtractor={(i, index) => i + index}
      />
    </AppView>
  );
};
