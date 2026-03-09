import { AppText, AppView } from '@/components/ui';

export interface SectionHeaderProps {
  label: string;
}

export const SectionHeader = ({ label }: SectionHeaderProps) => (
  <AppView row centerV gap-8 marginV-12>
    <AppView flex height={1} bg-lineDivider />
    <AppText body2 textColor light>
      {label}
    </AppText>
    <AppView flex height={1} bg-lineDivider />
  </AppView>
);
