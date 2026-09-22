import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import type { MilestoneType } from '@/hooks/roadmap/types/roadmap.types';
import { useLocalization } from '@/hooks/useLocalization';
import React from 'react';

interface MilestoneMetadataProps {
  milestone: MilestoneType;
}

export const MilestoneMetadata = ({ milestone }: MilestoneMetadataProps) => {
  const {
    duration_days_min,
    duration_days_max,
    resources_forecast,
    spikes,
    risks,
    acceptance_test,
  } = milestone;
  const { t } = useLocalization();

  const parseResourcesForecast = () => {
    try {
      return typeof resources_forecast === 'string'
        ? JSON.parse(resources_forecast)
        : resources_forecast;
    } catch {
      return null;
    }
  };

  const formatResourceValue = (value: string | string[]): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  };

  const resourcesData = parseResourcesForecast();

  return (
    <AppView padding-16 gap-12>
      {acceptance_test && (
        <AppView gap-4>
          <TranslatedText
            textColor
            body2
            translationKey="ai_roadmap.acceptance_test"
          />
          <AppText body2 light textColor>
            {acceptance_test}
          </AppText>
        </AppView>
      )}
      {duration_days_min != null && duration_days_max != null && (
        <AppView gap-4>
          <TranslatedText
            textColor
            body2
            translationKey="ai_roadmap.duration"
          />
          <AppText body2 light textColor>
            {duration_days_min === duration_days_max
              ? `${duration_days_min} ${t('common.days')}`
              : `${duration_days_min} - ${duration_days_max} ${t('common.days')}`}
          </AppText>
        </AppView>
      )}

      {resourcesData && typeof resourcesData === 'object' && (
        <AppView gap-4>
          <TranslatedText
            textColor
            body2
            translationKey="ai_roadmap.resources"
          />
          {Object.entries(resourcesData).map(([key, value]) => (
            <AppView key={key}>
              <AppText body2 light textColor>
                <AppText
                  body2
                  light
                  textColor
                  style={{ textTransform: 'capitalize' }}>
                  {key}:{' '}
                </AppText>
                {formatResourceValue(value as string | string[])}
              </AppText>
            </AppView>
          ))}
        </AppView>
      )}

      {spikes && spikes.length > 0 && (
        <AppView gap-4>
          <TranslatedText textColor body2 translationKey="ai_roadmap.spikes" />
          {spikes.map((spike) => (
            <AppView key={spike.spike_id}>
              <AppText body2 light textColor>
                • {spike.description} ({spike.timebox_days} {t('common.days')})
              </AppText>
            </AppView>
          ))}
        </AppView>
      )}

      {risks && risks.length > 0 && (
        <AppView gap-4>
          <TranslatedText textColor body2 translationKey="ai_roadmap.risks" />
          {risks.map((risk) => (
            <AppView key={risk.risk_id || risk.description}>
              <AppText body2 light textColor flex>
                • {risk.description}
              </AppText>
            </AppView>
          ))}
        </AppView>
      )}
    </AppView>
  );
};
