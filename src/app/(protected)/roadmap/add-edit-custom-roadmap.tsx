import { AppKeyboardController } from '@/components/AppKeyboardController';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { AddEditCustomRoadmapForm } from '@/components/roadmap/AddEditCustomRoadmapForm';
import { ScreenHeader } from '@/components/ScreenHeader';
import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

const AddEditCustomRoadmap = () => {
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
      <AddEditCustomRoadmapForm
        mode="create"
        onSuccess={() => {
          router.replace('/roadmap/roadmap-details');
        }}
      />
    </AppKeyboardController>
  );
};

export default AddEditCustomRoadmap;

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
  },
});
