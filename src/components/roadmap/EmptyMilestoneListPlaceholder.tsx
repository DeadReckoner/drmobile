import { AppCard } from '@/components/AppCard';
import { AppIcon } from '@/components/AppIcon';
import { Divider } from '@/components/Divider';
import { PrimaryButtonContainer } from '@/components/PrimaryButtonContainer';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';

interface EmptyMilestoneListPlaceholderProps {
  onPress: () => void;
}

export const EmptyMilestoneListPlaceholder = ({
  onPress,
}: EmptyMilestoneListPlaceholderProps) => {
  return (
    <AppCard paddingV-40>
      <AppView paddingH-16 center>
        <TranslatedText
          subtitle2
          translationKey="tabs.create_tab.no_milestones_yet"
        />
        <Divider />
        <TranslatedText
          xsm
          center
          translationKey="tabs.create_tab.no_milestones_yet_desc"
        />
      </AppView>
      <Divider margin-16 />
      <PrimaryButtonContainer row onPress={onPress}>
        <AppIcon name="plus" size={18} />
        <Divider margin-4 />
        <TranslatedText
          body2
          translationKey="tabs.create_tab.add_new_milestone"
        />
      </PrimaryButtonContainer>
    </AppCard>
  );
};
