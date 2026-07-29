import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomNav } from '@/components/BottomNav';
import { FixturesBanner } from '@/components/FixturesBanner';
import { LiveBadge, liveStateFor } from '@/components/LiveBadge';
import { colors, spacing } from '@/constants/theme';
import { ArrivalsTab } from '@/features/station/ArrivalsTab';
import { RoutesTab } from '@/features/station/RoutesTab';
import { StationHeader } from '@/features/station/StationHeader';
import { StationTabs, type StationTab } from '@/features/station/StationTabs';
import { useStationArrivals } from '@/features/station/useStationArrivals';
import { useStationParams } from '@/features/station/useStationParams';
import { useStationRoutes } from '@/features/station/useStationRoutes';
import { useRecent } from '@/store/recentStore';

export default function StationDetailScreen() {
  const { code, station } = useStationParams();
  const [tab, setTab] = useState<StationTab>('arrivals');

  const arrivals = useStationArrivals(code, tab === 'arrivals');
  const routes = useStationRoutes(code, tab === 'routes');

  const pushRecent = useRecent((s) => s.push);
  useEffect(() => {
    void pushRecent(station);
  }, [station, pushRecent]);

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <StationHeader station={station} />

        {tab === 'arrivals' && (
          <LiveBadge
            state={liveStateFor(arrivals.updatedAt, arrivals.error !== null)}
            updatedAt={arrivals.updatedAt}
          />
        )}

        <StationTabs active={tab} onChange={setTab} />
        <FixturesBanner />

        {tab === 'arrivals' ? (
          <ArrivalsTab
            arrivals={arrivals.arrivals}
            error={arrivals.error}
            isLoading={arrivals.isLoading}
            isRefreshing={arrivals.isRefreshing}
            stationCode={code}
            onRefresh={arrivals.refresh}
            onRetry={arrivals.retry}
          />
        ) : (
          <RoutesTab
            routes={routes.routes}
            error={routes.error}
            isLoading={routes.isLoading}
            stationCode={code}
            onRetry={routes.retry}
          />
        )}
      </SafeAreaView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: spacing.lg },
});
