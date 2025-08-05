import { AppScreen } from '@/components/AppScreen';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { RoadmapDetails } from '@/components/roadmap/RoadmapDetails';
import { useAppSelector } from '@/store/hooks/store.hooks';
import { selectDraftRoadmap } from '@/store/slices/roadmapDraftSlice';
import { ScrollView, StyleSheet } from 'react-native';

const RoadmapDetailsPage = () => {
  const roadmap = useAppSelector(selectDraftRoadmap);
  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <HeaderWithBack headerText={roadmap.Goal} />
        <Divider />
        <RoadmapDetails roadmap={roadmap} />
      </ScrollView>
    </AppScreen>
  );
};

export default RoadmapDetailsPage;

const styles = StyleSheet.create({
  scrollContainer: { paddingTop: 60 },
});
