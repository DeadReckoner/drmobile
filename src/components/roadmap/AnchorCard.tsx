import { AppAvatar } from '@/components/AppAvatar';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import React from 'react';
import { Colors } from 'react-native-ui-lib';

interface AnchorCardProps {
  anchorName?: string;
  onManageAnchor: () => void;
  onAddAnchor: () => void;
}

export const AnchorCard = ({
  anchorName,
  onManageAnchor,
  onAddAnchor,
}: AnchorCardProps) => {
  const isAnchorAssigned = !!anchorName;

  if (isAnchorAssigned) {
    return (
      <AppCard row centerV spread>
        <AppView row centerV gap-12>
          <AppIcon
            set="Feather"
            name="anchor"
            size={20}
            color={Colors.textColor}
          />
        </AppView>
        <AppView row gap-12 centerV>
          <AppAvatar size={14} />
          <AppText body2 textColor>
            {anchorName}
          </AppText>
        </AppView>
        <AppButton onPress={onManageAnchor}>
          <AppIcon set="Feather" name="menu" size={20} />
        </AppButton>
      </AppCard>
    );
  }

  return (
    <AppCard row centerV spread>
      <AppIcon set="Feather" name="anchor" size={20} color={Colors.textColor} />
      <TranslatedText body2 textColor translationKey="roadmap.add_anchor" />
      <AppButton onPress={onAddAnchor}>
        <AppIcon set="Feather" name="plus" size={22} />
      </AppButton>
    </AppCard>
  );
};
