import { AppButton } from '@/components/AppButton';
import { AppIcon } from '@/components/AppIcon';
import { AppActionSheet, AppText, AppView } from '@/components/ui';
import React, { ComponentProps } from 'react';
import { StyleSheet } from 'react-native';
import { ButtonProps, Colors } from 'react-native-ui-lib';

export const AppActionSheetModal = (
  props: ComponentProps<typeof AppActionSheet>,
) => {
  const renderTitle = () => (
    <AppView row centerV spread paddingH-16>
      <AppText textColor body1 style={styles.title}>
        {props.title}
      </AppText>
      <AppButton onPress={props.onDismiss}>
        <AppIcon name="close" />
      </AppButton>
    </AppView>
  );
  const renderOption = (
    option: ButtonProps & { icon?: React.ReactNode },
    index: number,
    onOptionPress: (_index: number) => void,
  ) => {
    return (
      <AppView
        key={option.label}
        style={[styles.option, { borderTopColor: Colors.lineDivider }]}>
        <AppButton paddingV-20 onPress={() => onOptionPress(index)}>
          <AppView row center spread>
            <AppText body2 textColor flex>
              {option.label}
            </AppText>
            <AppView center style={styles.iconContainer}>
              {option.icon}
            </AppView>
          </AppView>
        </AppButton>
      </AppView>
    );
  };
  return (
    <AppActionSheet
      dialogStyle={[
        styles.dialogContainer,
        {
          backgroundColor: Colors.transparent,
        },
      ]}
      containerStyle={[styles.container, { backgroundColor: Colors.pickerBG }]}
      renderAction={renderOption}
      renderTitle={renderTitle}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  option: {
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  title: {
    paddingBottom: 24,
    paddingTop: 20,
    maxWidth: '83%',
  },
  container: {
    borderRadius: 18,
    paddingBottom: 48,
    paddingTop: 8,
  },
  dialogContainer: {
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
  },
  iconContainer: {
    minWidth: 20,
  },
});
