import {
  ActionSheetOption,
  AppActionSheetModal,
} from '@/components/AppActionSheetModal';
import { RoadmapListItem } from '@/components/roadmap/RoadmapListItem';
import { RoadmapType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import { useRoadmapMenuOptions } from '@/hooks/useRoadmapMenuOptions';
import React, { useState } from 'react';

interface ArchivedRoadmapItemProps {
  roadmap: RoadmapType;
  showProgress?: boolean;
}

export const ArchivedRoadmapItem = ({
  roadmap,
  showProgress,
}: ArchivedRoadmapItemProps) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { t } = useLocalization();
  const { menuOptions, menuDialogs } = useRoadmapMenuOptions({
    roadmap,
    onMenuClose: () => setIsMenuVisible(false),
  });

  return (
    <>
      <RoadmapListItem
        roadmap={roadmap}
        onPress={() => setIsMenuVisible(true)}
        showProgress={showProgress}
      />
      <AppActionSheetModal
        title={t('roadmap.options')}
        visible={isMenuVisible}
        onDismiss={() => setIsMenuVisible(false)}
        options={menuOptions as ActionSheetOption[]}
      />
      {menuDialogs}
    </>
  );
};
