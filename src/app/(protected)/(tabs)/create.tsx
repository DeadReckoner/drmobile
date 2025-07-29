import { AppScreen } from '@/components/AppScreen';
import { CreateTabListItem } from '@/components/create/CreateTabListItem';
import { TranslatedText } from '@/components/TranslatedText';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import React from 'react';
import { FlatList, ListRenderItem } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CreateOption = {
  titleKey: TranslationKeysType;
  descriptionKey: TranslationKeysType;
};

const CREATE_OPTIONS: CreateOption[] = [
  {
    titleKey: 'tabs.create_tab.build_roadmap_ai',
    descriptionKey: 'tabs.create_tab.build_roadmap_ai_desc',
  },
  {
    titleKey: 'tabs.create_tab.build_roadmap_custom',
    descriptionKey: 'tabs.create_tab.build_roadmap_custom_desc',
  },
  {
    titleKey: 'tabs.create_tab.add_new_task',
    descriptionKey: 'tabs.create_tab.add_new_task_desc',
  },
];

const Create = () => {
  const insets = useSafeAreaInsets();

  const renderItem: ListRenderItem<CreateOption> = ({
    item: { titleKey, descriptionKey },
  }) => {
    return (
      <CreateTabListItem
        titleTranslationKey={titleKey}
        descriptionTranslationKey={descriptionKey}
      />
    );
  };
  return (
    <AppScreen>
      <FlatList
        contentContainerStyle={{ paddingTop: insets.top, gap: 24 }}
        ListHeaderComponent={() => (
          <TranslatedText h2 translationKey="tabs.create" />
        )}
        data={[
          ...CREATE_OPTIONS,
          ...CREATE_OPTIONS,
          ...CREATE_OPTIONS,
          ...CREATE_OPTIONS,
          ...CREATE_OPTIONS,
          ...CREATE_OPTIONS,
          ...CREATE_OPTIONS,
          ...CREATE_OPTIONS,
          ...CREATE_OPTIONS,
          ...CREATE_OPTIONS,
          ...CREATE_OPTIONS,
          ...CREATE_OPTIONS,
        ]}
        renderItem={renderItem}
      />
    </AppScreen>
  );
};

export default Create;
