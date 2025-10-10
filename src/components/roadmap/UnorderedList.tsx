import { AppList } from '@/components/AppList';
import { Divider } from '@/components/Divider';
import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import { TranslationKeysType } from '@/lib/localization/types/i18n.types';
import React from 'react';

interface UnorderedListProps {
  data: {
    title: TranslationKeysType;
    value: string;
  }[];
}

export const UnorderedList = ({ data }: UnorderedListProps) => {
  const renderItem = ({
    item,
  }: {
    item: { title: TranslationKeysType; value: string };
  }) => (
    <AppView gap-4 marginT-8>
      <AppView row gap-8 centerV>
        <AppText textColor body1>
          •
        </AppText>
        <TranslatedText caption translationKey={item.title} />
      </AppView>
      <AppText xsm textColor marginL-16>
        {item.value}
      </AppText>
    </AppView>
  );
  return (
    <AppList
      data={data}
      renderItem={renderItem}
      ItemSeparatorComponent={() => <Divider margin-4 />}
    />
  );
};
