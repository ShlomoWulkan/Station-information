import { useState } from 'react';
import { FlatList, TextInput, RefreshControl, Text, View } from 'react-native';
import { BusArrivalRow } from '@/components/BusArrivalRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { stationStrings } from '@/constants/strings';
import { colors } from '@/constants/theme';
import { useA11y } from '@/hooks/useA11y';
import type { BusArrival } from '@/types';
import { styles } from './ArrivalsTab.styles';

interface Props {
  arrivals: BusArrival[];
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  stationCode: string;
  /** מתי הנתון התקבל — השורות גוזרות ממנו את הספירה לאחור. */
  updatedAt: number | null;
  onRefresh: () => void;
  onRetry: () => void;
}

export function ArrivalsTab({
  arrivals,
  error,
  isLoading,
  isRefreshing,
  stationCode,
  updatedAt,
  onRefresh,
  onRetry,
}: Props) {
  const { font, c } = useA11y();
  const [filter, setFilter] = useState('');

  const trimmed = filter.trim();
  const visible = trimmed ? arrivals.filter((a) => a.lineNumber.includes(trimmed)) : arrivals;

  const hasData = arrivals.length > 0;

  return (
    <>
      <TextInput
        style={[styles.filter, { fontSize: font(14), color: c.text }]}
        value={filter}
        onChangeText={setFilter}
        placeholder={stationStrings.filterPlaceholder}
        placeholderTextColor={c.textSub}
        keyboardType="number-pad"
        accessibilityLabel={stationStrings.filterLabel}
      />

      {/* FlatList ולא ScrollView: תחנה מרכזית מחזירה עשרות נסיעות, וללא
          וירטואליזציה כולן מרונדרות בבת אחת. */}
      <FlatList
        data={visible}
        keyExtractor={(arrival) => arrival.id}
        renderItem={({ item }) => (
          <BusArrivalRow
            arrival={item}
            currentStationCode={stationCode}
            receivedAt={updatedAt}
          />
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        ListHeaderComponent={
          <View>
            {isLoading && !hasData && <LoadingState />}
            {error !== null && !hasData && <ErrorState message={error} onRetry={onRetry} />}
            {/* כשל רענון כשיש כבר נתון — הערה, בלי למחוק את הקיים */}
            {error !== null && hasData && (
              <Text style={[styles.staleNote, { fontSize: font(12) }]}>
                {error} {stationStrings.showingLastKnown}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          !isLoading && error === null ? (
            <EmptyState
              title={hasData ? stationStrings.noFilterMatch(trimmed) : stationStrings.noArrivals}
            />
          ) : null
        }
      />
    </>
  );
}
