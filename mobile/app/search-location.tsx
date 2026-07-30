import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StationRow } from '@/components/StationRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { searchStrings } from '@/constants/strings';
import { colors, spacing } from '@/constants/theme';
import { ScreenHeader } from '@/features/search/ScreenHeader';
import { useNearbyStations } from '@/features/search/useNearbyStations';

export default function SearchLocationScreen() {
  const { stations, error, isLoading, search } = useNearbyStations();

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader
          title={searchStrings.byLocationTitle}
          action={{
            icon: '🔄',
            label: searchStrings.refresh,
            onPress: search,
            disabled: isLoading,
          }}
        />

        {isLoading && <LoadingState />}
        {error !== null && <ErrorState message={error} onRetry={search} />}

        <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
          {!isLoading && error === null && stations.length === 0 && (
            <EmptyState title={searchStrings.byLocationEmpty} />
          )}
          {stations.map((station) => (
            <StationRow key={station.id} station={station} />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  results: { flex: 1 },
});
