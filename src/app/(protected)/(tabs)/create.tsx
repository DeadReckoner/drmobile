import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { CreateTabListItem } from '@/components/roadmap/CreateTabListItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { router } from 'expo-router';

const Create = () => {
  const onAIRoadmapPress = () => {
    router.push('/roadmap/ai-roadmap');
  };
  const onCustomRoadmapPress = () => {
    router.push('/roadmap/custom-roadmap');
  };
  const onAddNewTaskPress = () => {
    router.push('/task/add-task');
  };
  return (
    <AppScreen safeArea>
      <TranslatedText h2 translationKey="tabs.create" />
      <Divider />
      <AppView gap-16>
        <CreateTabListItem
          type="ai"
          titleKey="tabs.create_tab.build_roadmap_ai"
          descriptionKey="tabs.create_tab.build_roadmap_ai_desc"
          onPress={onAIRoadmapPress}
          icon={<AppIcon set="Feather" name="map" />}
        />
        <CreateTabListItem
          type="custom"
          titleKey="tabs.create_tab.build_roadmap_custom"
          descriptionKey="tabs.create_tab.build_roadmap_custom_desc"
          onPress={onCustomRoadmapPress}
          icon={<AppIcon set="Feather" name="map" />}
        />
        <CreateTabListItem
          type="task"
          titleKey="tabs.create_tab.add_new_task"
          descriptionKey="tabs.create_tab.add_new_task_desc"
          icon={<AppIcon name="addfile" />}
          onPress={onAddNewTaskPress}
        />
        <CreateTabListItem
          type="import_plan"
          titleKey="tabs.create_tab.import_plan"
          descriptionKey="tabs.create_tab.import_plan_desc"
          onPress={onAddNewTaskPress}
          icon={<AppIcon name="export" />}
        />
      </AppView>
    </AppScreen>
  );
};

export default Create;
