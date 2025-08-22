import { AppIcon } from '@/components/AppIcon';
import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { CreateTabListItem } from '@/components/roadmap/CreateTabListItem';
import { TranslatedText } from '@/components/TranslatedText';
import { AppView } from '@/components/ui';
import { router } from 'expo-router';
import { ScrollView } from 'react-native';
import { Colors } from 'react-native-ui-lib';

const Create = () => {
  const onAIRoadmapPress = () => {
    router.navigate('/roadmap/ai-roadmap');
  };
  const onCustomRoadmapPress = () => {
    router.navigate('/roadmap/add-edit-custom-roadmap');
  };
  const onAddNewTaskPress = () => {
    router.navigate('/task/add-edit-standalone-task');
  };
  return (
    <AppScreen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="always">
        <Divider />
        <TranslatedText h2 translationKey="tabs.create" />
        <Divider />
        <AppView gap-16>
          <CreateTabListItem
            type="ai"
            titleKey="tabs.create_tab.build_roadmap_ai"
            descriptionKey="tabs.create_tab.build_roadmap_ai_desc"
            onPress={onAIRoadmapPress}
            icon={<AppIcon set="Feather" name="map" color={Colors.white} />}
          />
          <CreateTabListItem
            type="custom"
            titleKey="tabs.create_tab.build_roadmap_custom"
            descriptionKey="tabs.create_tab.build_roadmap_custom_desc"
            onPress={onCustomRoadmapPress}
            icon={<AppIcon set="Feather" name="map" color={Colors.white} />}
          />
          <CreateTabListItem
            type="task"
            titleKey="tabs.create_tab.add_new_task_or_habit"
            descriptionKey="tabs.create_tab.add_new_task_desc"
            icon={<AppIcon name="addfile" color={Colors.white} />}
            onPress={onAddNewTaskPress}
          />
          <CreateTabListItem
            type="import_plan"
            titleKey="tabs.create_tab.import_plan"
            descriptionKey="tabs.create_tab.import_plan_desc"
            onPress={onAddNewTaskPress}
            icon={<AppIcon name="export" color={Colors.white} />}
          />
          <Divider />
        </AppView>
      </ScrollView>
    </AppScreen>
  );
};

export default Create;
