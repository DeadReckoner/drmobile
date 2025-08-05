import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import CreateMilestoneForm from '@/components/roadmap/CreateMilestoneForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectDraftRoadmap } from '@/store/slices/roadmapDraftSlice';
import { ScrollView, StyleSheet } from 'react-native';

const AddMilestone = () => {
  const roadmap = useAppSelector(selectDraftRoadmap);
  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <HeaderWithBack headerText={roadmap.Goal} />
        <Divider />
        <ScreenHeader
          title="tabs.create_tab.add_new_milestone"
          subtitle="tabs.create_tab.add_new_milestone_desc"
          titleProps={{ body1: true }}
          subtileProps={{ xsm: true }}
        />
        <Divider margin-16 />
        <CreateMilestoneForm />
      </ScrollView>
    </AppScreen>
  );
};

export default AddMilestone;

const styles = StyleSheet.create({
  scrollContainer: { paddingTop: 60 },
});
