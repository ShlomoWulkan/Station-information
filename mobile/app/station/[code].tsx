import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { BusArrivalRow } from '@/components/BusArrivalRow';
import { LiveBadge } from '@/components/LiveBadge';
import { useFavorites } from '@/store/favoritesStore';
import { fetchArrivals } from '@/services/api';
import { colors, spacing, radius } from '@/constants/theme';
import type { BusArrival, Station } from '@/types';

export default function StationDetailScreen() {
  const { code, name, lat, lon } = useLocalSearchParams<{ code: string; name: string; lat: string; lon: string }>();
  const [arrivals, setArrivals] = useState<BusArrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const station: Station = { id: code, code, name: name ?? `תחנה ${code}`, lat: lat ? +lat : undefined, lon: lon ? +lon : undefined };
  const insets = useSafeAreaInsets();
  const { isFavorite, add, remove } = useFavorites();
  const fav = isFavorite(station.id);

  const loadArrivals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchArrivals(code);
      setArrivals(data);
    } catch {
      setError('לא ניתן לטעון נסיעות כרגע');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadArrivals(); }, [code]);

  const filtered = filter.trim()
    ? arrivals.filter(a => a.lineNumber.includes(filter.trim()))
    : arrivals;

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>

        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.stationName}>{station.name}</Text>
            <Text style={styles.stationCode}>תחנה {code}</Text>
          </View>
          <TouchableOpacity onPress={() => fav ? remove(station.id) : add(station)} style={styles.favBtn}>
            <Text style={styles.favIcon}>{fav ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        </View>

        <LiveBadge />

        {/* Filter */}
        <TextInput
          style={styles.filterInput}
          value={filter}
          onChangeText={setFilter}
          placeholder="סינון לפי מספר קו..."
          placeholderTextColor={colors.textSub}
          keyboardType="number-pad"
          textAlign="right"
        />

        {/* Arrivals */}
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {loading && <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />}
          {error && (
            <View style={styles.errorWrap}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={loadArrivals}>
                <Text style={styles.retryText}>נסה שוב</Text>
              </TouchableOpacity>
            </View>
          )}
          {!loading && !error && filtered.length === 0 && (
            <Text style={styles.empty}>אין נסיעות קרובות</Text>
          )}
          {filtered.map((a, i) => <BusArrivalRow key={i} arrival={a} />)}
        </ScrollView>

      </SafeAreaView>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom + 4, height: 52 + insets.bottom }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.navigate('/(tabs)/settings')}>
          <Text style={styles.tabEmoji}>⚙️</Text>
          <Text style={styles.tabLabel}>הגדרות</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.navigate('/(tabs)/map')}>
          <Text style={styles.tabEmoji}>🗺️</Text>
          <Text style={styles.tabLabel}>מפה</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.navigate('/(tabs)/favorites')}>
          <Text style={styles.tabEmoji}>⭐</Text>
          <Text style={styles.tabLabel}>מועדפים</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.dismissAll()}>
          <Text style={styles.tabEmoji}>🏠</Text>
          <Text style={styles.tabLabel}>בית</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.lg, marginBottom: spacing.md },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  closeText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  headerInfo: { flex: 1, alignItems: 'flex-end' },
  stationName: { fontSize: 18, fontWeight: '800', color: colors.text },
  stationCode: { fontSize: 12, color: colors.textSub, marginTop: 2 },
  favBtn: { padding: spacing.xs },
  favIcon: { fontSize: 24 },
  filterInput: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: 14,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  list: { flex: 1 },
  empty: { color: colors.textSub, textAlign: 'center', marginTop: spacing.xl, fontSize: 14 },
  errorWrap: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.md },
  errorText: { color: '#f87171', fontSize: 14, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  retryText: { color: '#000d28', fontWeight: '800', fontSize: 13 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.tabBar,
    borderTopColor: colors.tabBarBorder,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  tabEmoji: { fontSize: 20 },
  tabLabel: { fontSize: 10, fontWeight: '700', color: colors.tabInactive },
});
