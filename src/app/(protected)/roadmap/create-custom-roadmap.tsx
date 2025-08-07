import { AppKeyboardController } from '@/components/AppKeyboardController';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { CreateCustomRoadmapForm } from '@/components/roadmap/CreateCustomRoadmapForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StyleSheet } from 'react-native';

const CreateCustomRoadmap = () => {
  return (
    <AppKeyboardController containerStyle={styles.container}>
      <HeaderWithBack headerKey="tabs.create_tab.custom_roadmap" />
      <Divider />
      <ScreenHeader
        title="tabs.create_tab.build_roadmap_custom"
        subtitle="tabs.create_tab.build_roadmap_custom_desc"
        titleProps={{ body1: true }}
        subtileProps={{ xsm: true }}
      />
      <CreateCustomRoadmapForm />
    </AppKeyboardController>
  );
};

export default CreateCustomRoadmap;

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
  },
});
