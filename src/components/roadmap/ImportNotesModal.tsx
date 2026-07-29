import { AppIcon } from '@/components/AppIcon';
import { AppModal } from '@/components/AppModal';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { ImportFidelityType } from '@/hooks/roadmap/types/roadmap.types';
import { useAppDispatch, useAppSelector } from '@/store/hooks/store.hooks';
import {
  markImportNotesShownAction,
  selectImportNotes,
  selectShouldShowImportNotes,
} from '@/store/slices/planImportSlice';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const FIDELITY_CONFIG: Record<
  ImportFidelityType,
  { color: string; translationKey: string; iconName: string }
> = {
  high: {
    color: Colors.success,
    translationKey: 'plan_import.notes.fidelity_high',
    iconName: 'checkmark-circle',
  },
  medium: {
    color: Colors.warning,
    translationKey: 'plan_import.notes.fidelity_medium',
    iconName: 'alert-circle',
  },
  low: {
    color: Colors.error,
    translationKey: 'plan_import.notes.fidelity_low',
    iconName: 'warning',
  },
};

export const ImportNotesModal = () => {
  const dispatch = useAppDispatch();
  const shouldShow = useAppSelector(selectShouldShowImportNotes);
  const importNotes = useAppSelector(selectImportNotes);

  const handleDismiss = () => {
    dispatch(markImportNotesShownAction());
  };

  if (!importNotes) return null;

  const fidelityConfig = FIDELITY_CONFIG[importNotes.fidelity];

  return (
    <AppModal
      visible={shouldShow}
      setIsVisible={(visible) => {
        if (!visible) handleDismiss();
      }}
      snapPoints={['55%', '85%']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppView gap-16 paddingB-24>
          <TranslatedText h3 translationKey="plan_import.notes.title" />

          {/* Fidelity Badge */}
          <AppView
            row
            centerV
            gap-8
            padding-12
            br30
            style={[
              styles.fidelityBadge,
              { backgroundColor: `${fidelityConfig.color}20` },
            ]}>
            <AppIcon
              set="Ionicons"
              name={fidelityConfig.iconName as any}
              size={20}
              color={fidelityConfig.color}
            />
            <TranslatedText
              body2
              style={{ color: fidelityConfig.color }}
              translationKey={fidelityConfig.translationKey as any}
            />
          </AppView>

          {/* Source Summary */}
          {!!importNotes.source_summary && (
            <AppView gap-4>
              <TranslatedText
                body2
                semibold
                translationKey="plan_import.notes.source_summary"
              />
              <AppText body2 textSecondary>
                {importNotes.source_summary}
              </AppText>
            </AppView>
          )}

          {/* Inferred Items */}
          {importNotes.inferred.length > 0 && (
            <AppView gap-8>
              <TranslatedText
                body2
                semibold
                translationKey="plan_import.notes.inferred"
              />
              {importNotes.inferred.map((item, index) => (
                <AppView key={index} row gap-8 paddingL-4>
                  <AppIcon
                    set="Ionicons"
                    name="information-circle-outline"
                    size={16}
                    color={Colors.warning}
                  />
                  <AppText body2 textSecondary flex-1>
                    {item}
                  </AppText>
                </AppView>
              ))}
            </AppView>
          )}

          {/* Dropped Items */}
          {importNotes.dropped.length > 0 && (
            <AppView gap-8>
              <TranslatedText
                body2
                semibold
                translationKey="plan_import.notes.dropped"
              />
              {importNotes.dropped.map((item, index) => (
                <AppView key={index} row gap-8 paddingL-4>
                  <AppIcon
                    set="Ionicons"
                    name="remove-circle-outline"
                    size={16}
                    color={Colors.textSecondary}
                  />
                  <AppText body2 textSecondary flex-1>
                    {item}
                  </AppText>
                </AppView>
              ))}
            </AppView>
          )}

          <PrimaryButton
            label="plan_import.notes.dismiss"
            onPress={handleDismiss}
          />
        </AppView>
      </ScrollView>
    </AppModal>
  );
};

const styles = StyleSheet.create({
  fidelityBadge: {
    alignSelf: 'flex-start',
  },
});
