import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { CreateTabListItem } from '@/components/roadmap/CreateTabListItem';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import {
  isTemplatesCatalogEmpty,
  TEMPLATES_CATALOG,
} from '@/hooks/templates/templatesCatalog';
import { router } from 'expo-router';
import { ScrollView } from 'react-native';
import { Colors } from 'react-native-ui-lib';

/**
 * The Templates library. Lists ready-made templates from the catalog once they
 * exist; until then it renders an intentional empty state rather than empty
 * category sections or placeholder cards.
 */
const Templates = () => {
  return (
    <AppScreen safeArea>
      <HeaderWithBack headerKey="templates.header" paddingT-8 />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Divider />
        <TranslatedText xsm translationKey="templates.intro" />
        <Divider />
        {isTemplatesCatalogEmpty() ? (
          <EmptyListItemPlaceholder
            title="templates.empty_title"
            subtitle="templates.empty_description"
          />
        ) : (
          <AppView gap-12>
            {TEMPLATES_CATALOG.map((template) => (
              <CreateTabListItem
                key={template.id}
                titleKey={template.titleKey}
                descriptionKey={template.descriptionKey}
                onPress={() => router.navigate(template.route)}
                icon={
                  <AppIcon set="Feather" name="layers" color={Colors.white} />
                }
              />
            ))}
          </AppView>
        )}
        <Divider margin-24 />
      </ScrollView>
    </AppScreen>
  );
};

export default Templates;
