import { TranslatedText } from '@/components/TranslatedText';
import { AppText, AppView } from '@/components/ui';
import type { MacroMilestone } from '@/hooks/roadmap/types/roadmap.types';
import React from 'react';

interface MacroMilestoneMetadataProps {
  macroMilestone: MacroMilestone;
}

export const MacroMilestoneMetadata = ({
  macroMilestone,
}: MacroMilestoneMetadataProps) => {
  const {
    duration_days_min,
    duration_days_max,
    resources_forecast,
    spikes,
    risks,
    acceptance_test,
  } = macroMilestone;

  const parseResourcesForecast = () => {
    try {
      return typeof resources_forecast === 'string'
        ? JSON.parse(resources_forecast)
        : resources_forecast;
    } catch {
      return null;
    }
  };

  const formatResourceValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  };

  const resourcesData = parseResourcesForecast();

  return (
    <AppView padding-16 gap-12>
      <AppView gap-4>
        <TranslatedText
          textColor
          caption
          translationKey="ai_roadmap.acceptance_test"
        />
        <AppText xsm textColor>
          {acceptance_test}
        </AppText>
      </AppView>
      <AppView gap-4>
        <TranslatedText
          textColor
          caption
          translationKey="ai_roadmap.duration"
        />
        <AppText xsm textColor>
          {duration_days_min === duration_days_max
            ? `${duration_days_min} days`
            : `${duration_days_min} - ${duration_days_max} days`}
        </AppText>
      </AppView>

      {resourcesData && typeof resourcesData === 'object' && (
        <AppView gap-4>
          <TranslatedText
            textColor
            caption
            translationKey="ai_roadmap.resources"
          />
          {Object.entries(resourcesData).map(([key, value]) => (
            <AppView key={key}>
              <AppText xsm textColor>
                <AppText xsm textColor style={{ textTransform: 'capitalize' }}>
                  {key}:{' '}
                </AppText>
                {formatResourceValue(value)}
              </AppText>
            </AppView>
          ))}
        </AppView>
      )}

      {spikes && spikes.length > 0 && (
        <AppView gap-4>
          <TranslatedText
            textColor
            caption
            translationKey="ai_roadmap.spikes"
          />
          {spikes.map((spike) => (
            <AppView key={spike.spike_id}>
              <AppText xsm textColor>
                • {spike.description} ({spike.timebox_days} days)
              </AppText>
            </AppView>
          ))}
        </AppView>
      )}

      {risks && risks.length > 0 && (
        <AppView gap-4>
          <AppText textColor caption>
            Risks
          </AppText>
          {risks.map((risk) => (
            <AppView key={risk.risk_id || risk.description}>
              <AppText xsm textColor flex>
                • {risk.description}
              </AppText>
            </AppView>
          ))}
        </AppView>
      )}
    </AppView>
  );
};
