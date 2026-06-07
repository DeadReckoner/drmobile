import { AppIcon } from '@/components/AppIcon';
import { LineDivider } from '@/components/LineDivider';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { StyleSheet } from 'react-native';

const INDENT = 36;
const ICON_SIZE = 44;

const CONNECTOR_LINES = [
  { height: '75%', marginLeft: 16 },
  { height: '50%', marginLeft: 48 },
  { height: '25%', marginLeft: 82 },
] as const;

const HIERARCHY = [
  {
    level: '1',
    titleKey: 'feature_highlight.hierarchy_phase' as const,
    icon: <AppIcon set="Feather" name="trello" size={20} />,
  },
  {
    level: '2',
    titleKey: 'feature_highlight.hierarchy_milestone' as const,
    icon: <AppIcon set="Feather" name="flag" size={20} />,
  },
  {
    level: '3',
    titleKey: 'feature_highlight.hierarchy_task' as const,
    icon: <AppIcon set="Feather" name="clipboard" size={20} />,
  },
  {
    level: '4',
    titleKey: 'feature_highlight.hierarchy_step' as const,
    icon: <AppIcon set="Feather" name="check-square" size={18} />,
  },
];

export const RoadmapIntroContent = () => {
  const { t } = useLocalization();

  return (
    <AppView gap-16 paddingB-16>
      <TranslatedText
        xsm
        translationKey="feature_highlight.roadmap_intro_message"
      />
      <LineDivider marginV-4 />
      <AppView gap-16>
        {HIERARCHY.map((item, index) => {
          return (
            <AppView
              key={item.titleKey}
              row
              centerV
              gap-8
              style={{ paddingLeft: index * INDENT }}>
              {item.icon}
              <AppView flex>
                <AppText sm secondary style={styles.levelLabel}>
                  {t('feature_highlight.hierarchy_level')} {item.level}
                </AppText>
                <AppText xsm regular textColor marginT-2>
                  {t(item.titleKey)}
                </AppText>
              </AppView>
            </AppView>
          );
        })}
        {CONNECTOR_LINES.map(({ height, marginLeft }) => (
          <AppView
            key={marginLeft}
            absB
            width={1}
            bg-primary
            style={{ position: 'absolute', height, marginLeft }}
          />
        ))}
      </AppView>
    </AppView>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 12,
  },
  levelLabel: {
    textTransform: 'uppercase',
  },
});
