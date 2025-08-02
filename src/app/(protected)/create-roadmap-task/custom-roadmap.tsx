import { AppKeyboardController } from '@/components/AppKeyboardController';
import CreateCustomRoadmapForm from '@/components/create/CreateCustomRoadmapForm';
import { Divider } from '@/components/Divider';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { ScreenHeader } from '@/components/ScreenHeader';
import React from 'react';

const CustomRoadmap = () => {
  return (
    <AppKeyboardController>
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

export default CustomRoadmap;
