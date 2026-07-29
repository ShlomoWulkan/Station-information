import { View, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { BottomNav } from '@/components/BottomNav';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { colors, spacing } from '@/constants/theme';
import { RouteStopsHeader } from '@/features/route-stops/RouteStopsHeader';
import { StopRow } from '@/features/route-stops/StopRow';
import { useRouteStops } from '@/features/route-stops/useRouteStops';

export default function RouteStopsScreen() {
  const { lineNumber, stationCode } = useLocalSearchParams<{
    lineNumber: string;
    stationCode: string;
  }>();

  const { stops, error, isLoading, retry } = useRouteStops(stationCode, lineNumber);

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <RouteStopsHeader lineNumber={lineNumber} />

        {isLoading && <LoadingState />}
        {error !== null && <ErrorState message={error} onRetry={retry} />}

        {!isLoading && error === null && (
          <FlatList
            data={stops}
            keyExtractor={(stop) => stop.id}
            renderItem={({ item, index }) => (
              <StopRow
                stop={item}
                // השרת מסמן isCurrent, אבל לא בכל הנתיבים — נופלים להשוואת קוד.
                isCurrent={item.isCurrent === true || item.code === stationCode}
                isLast={index === stops.length - 1}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
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
  list: { paddingBottom: spacing.xl },
});
