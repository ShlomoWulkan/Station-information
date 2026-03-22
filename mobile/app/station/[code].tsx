import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { BusArrivalRow } from '@/components/BusArrivalRow';
import { LiveBadge } from '@/components/LiveBadge';
import { useFavorites } from '@/store/favoritesStore';
import { useRecent } from '@/store/recentStore';
import { fetchArrivals, fetchRoutes } from '@/services/api';
import { getArrivals as getMockArrivals } from '@/services/mockData';
import { colors, spacing, radius } from '@/constants/theme';
import type { BusArrival, Station } from '@/types';

type Tab = 'arrivals' | 'routes';

export default function StationDetailScreen() {
  const { code, name, lat, lon } = useLocalSearchParams<{ code: string; name: string; lat: string; lon: string }>();
  const [tab, setTab]           = useState<Tab>('arrivals');
  const [arrivals, setArrivals] = useState<BusArrival[]>([]);
  const [routes, setRoutes]     = useState<{ lineNumber: string; destination: string }[]>([]);
  const [loadingArr, setLoadingArr] = useState(true);
  const [loadingRts, setLoadingRts] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [filter, setFilter]     = useState('');

  const station: Station = { id: String(code), code: String(code), name: name ?? `תחנה ${code}`, lat: lat ? +lat : undefined, lon: lon ? +lon : undefined };
  const insets = useSafeAreaInsets();
  const { isFavorite, add, remove } = useFavorites();
  const { push: pushRecent } = useRecent();
  const fav = isFavorite(station.id);

  const loadArrivals = async () => {
    setLoadingArr(true);
    setError(null);
    try {
      setArrivals(await fetchArrivals(code));
    } catch {
      setArrivals(getMockArrivals(code));
    } finally {
      setLoadingArr(false);
    }
  };

  const loadRoutes = async () => {
    if (routes.length > 0) return;
    setLoadingRts(true);
    try {
      setRoutes(await fetchRoutes(code));
    } catch {
      setRoutes([]);
    } finally {
      setLoadingRts(false);
    }
  };

  useEffect(() => {
    loadArrivals();
    pushRecent(station);
  }, [code]);

  const handleTab = (t: Tab) => {
    setTab(t);
    if (t === 'routes') loadRoutes();
  };

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

        {/* Tabs */}
        <View style={styles.tabSwitch}>
          <TouchableOpacity
            style={[styles.tabSwitchBtn, tab === 'routes' && styles.tabSwitchActive]}
            onPress={() => handleTab('routes')}
          >
            <Text style={[styles.tabSwitchText, tab === 'routes' && styles.tabSwitchTextActive]}>
              קווים
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabSwitchBtn, tab === 'arrivals' && styles.tabSwitchActive]}
            onPress={() => handleTab('arrivals')}
          >
            <Text style={[styles.tabSwitchText, tab === 'arrivals' && styles.tabSwitchTextActive]}>
              זמני הגעה
            </Text>
          </TouchableOpacity>
        </View>

        {/* Arrivals Tab */}
        {tab === 'arrivals' && (
          <>
            <TextInput
              style={styles.filterInput}
              value={filter}
              onChangeText={setFilter}
              placeholder="סינון לפי מספר קו..."
              placeholderTextColor={colors.textSub}
              keyboardType="number-pad"
              textAlign="right"
            />
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {loadingArr && <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />}
              {error && (
                <View style={styles.errorWrap}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={loadArrivals}>
                    <Text style={styles.retryText}>נסה שוב</Text>
                  </TouchableOpacity>
                </View>
              )}
              {!loadingArr && !error && filtered.length === 0 && (
                <Text style={styles.empty}>אין נסיעות בזמן הקרוב</Text>
              )}
              {filtered.map((a, i) => <BusArrivalRow key={i} arrival={a} currentStationCode={code} />)}
            </ScrollView>
          </>
        )}

        {/* Routes Tab */}
        {tab === 'routes' && (
          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {loadingRts && <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />}
            {!loadingRts && routes.length === 0 && (
              <Text style={styles.empty}>אין מידע על קווים</Text>
            )}
            {routes.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={styles.routeRow}
                onPress={() => router.push({ pathname: '/route/[lineNumber]', params: { lineNumber: r.lineNumber, currentCode: code } })}
                activeOpacity={0.7}
              >
                <View style={styles.routeBadge}>
                  <Text style={styles.routeNum}>{r.lineNumber}</Text>
                </View>
                <Text style={styles.routeDest}>{r.destination}</Text>
                <Text style={styles.routeArrow}>‹</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

      </SafeAreaView>

      {/* Tab Bar */}
      <View style={[styles.navBar, { paddingBottom: insets.bottom + 4, height: 52 + insets.bottom }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.navigate('/(tabs)/settings')}>
          <Text style={styles.navEmoji}>⚙️</Text>
          <Text style={styles.navLabel}>הגדרות</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.navigate('/(tabs)/map')}>
          <Text style={styles.navEmoji}>🗺️</Text>
          <Text style={styles.navLabel}>מפה</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.navigate('/(tabs)/favorites')}>
          <Text style={styles.navEmoji}>⭐</Text>
          <Text style={styles.navLabel}>מועדפים</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.dismissAll()}>
          <Text style={styles.navEmoji}>🏠</Text>
          <Text style={styles.navLabel}>בית</Text>
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

  tabSwitch: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  tabSwitchBtn: { flex: 1, paddingVertical: 8, borderRadius: radius.sm, alignItems: 'center' },
  tabSwitchActive: { backgroundColor: colors.accent },
  tabSwitchText: { fontSize: 13, fontWeight: '700', color: colors.textSub },
  tabSwitchTextActive: { color: '#000d28' },

  filterInput: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: 14,
    marginBottom: spacing.md,
    textAlign: 'right',
  },
  list: { flex: 1 },
  empty: { color: colors.textSub, textAlign: 'center', marginTop: spacing.xl, fontSize: 14 },
  errorWrap: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.md },
  errorText: { color: '#f87171', fontSize: 14, textAlign: 'center' },
  retryBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  retryText: { color: '#000d28', fontWeight: '800', fontSize: 13 },

  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  routeBadge: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    minWidth: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  routeNum: { color: '#000d28', fontSize: 14, fontWeight: '900' },
  routeDest: { flex: 1, color: colors.text, fontSize: 14, textAlign: 'right' },
  routeArrow: { color: colors.textSub, fontSize: 18, fontWeight: '300' },

  navBar: {
    flexDirection: 'row',
    backgroundColor: colors.tabBar,
    borderTopColor: colors.tabBarBorder,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  navEmoji: { fontSize: 20 },
  navLabel: { fontSize: 10, fontWeight: '700', color: colors.tabInactive },
});
