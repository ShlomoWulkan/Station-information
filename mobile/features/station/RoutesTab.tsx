import { ScrollView, StyleSheet } from 'react-native';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { stationStrings } from '@/constants/strings';
import type { StationRoute } from '@/types';
import { RouteRow } from './RouteRow';

interface Props {
  routes: StationRoute[];
  error: string | null;
  isLoading: boolean;
  stationCode: string;
  onRetry: () => void;
}

export function RoutesTab({ routes, error, isLoading, stationCode, onRetry }: Props) {
  return (
    <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
      {isLoading && <LoadingState />}

      {error !== null && <ErrorState message={error} onRetry={onRetry} />}

      {!isLoading && error === null && routes.length === 0 && (
        <EmptyState title={stationStrings.noRoutes} />
      )}

      {routes.map((route) => (
        <RouteRow
          key={`${route.lineNumber}-${route.destination}`}
          route={route}
          stationCode={stationCode}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ list: { flex: 1 } });
