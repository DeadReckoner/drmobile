import { AppList } from '@/components/AppList';
import { AppScreen } from '@/components/AppScreen';
import { AnchoringItem } from '@/components/friends/AnchoringItem';
import { HeaderWithBack } from '@/components/HeaderWithBack';
import { EmptyListItemPlaceholder } from '@/components/roadmap/EmptyListItemPlaceholder';
import { AppView } from '@/components/ui';
import { useLocalization } from '@/hooks/useLocalization';
import { useToast } from '@/hooks/useToast';
import { useGetAnchoringQuery } from '@/store/apis/friendsApi';
import { useEffect } from 'react';

export const Anchoring = () => {
  const { data, isLoading, error } = useGetAnchoringQuery();
  const { showToast } = useToast();
  const { t } = useLocalization();

  useEffect(() => {
    if (error) {
      showToast({
        type: 'failure',
        message: t('common.something_went_wrong'),
      });
    }
  }, [error, showToast, t]);

  return (
    <AppScreen>
      <AppList
        keyExtractor={(i) => i.user.user_id}
        contentInsetAdjustmentBehavior="automatic"
        ListHeaderComponent={() => (
          <AppView marginB-16>
            <HeaderWithBack />
          </AppView>
        )}
        data={data?.users || []}
        ListEmptyComponent={
          !isLoading ? (
            <AppView marginT-16>
              <EmptyListItemPlaceholder
                title="settings.no_anchors_found"
                subtitle="settings.no_anchors_found_description"
              />
            </AppView>
          ) : null
        }
        renderItem={({ item: anchoringUser }) => (
          <AnchoringItem
            key={anchoringUser.user.user_id}
            anchoringUser={anchoringUser}
          />
        )}
      />
    </AppScreen>
  );
};
