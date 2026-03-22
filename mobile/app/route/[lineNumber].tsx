import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { fetchRouteStops } from '@/services/api';
import { colors, spacing, radius } from '@/constants/theme';

interface RouteStop {
  id: string; code: string; name: string;
  lat: number; lon: number; sequence: number; isCurrent?: boolean;
}

export default function RouteStopsScreen() {
  const { lineNumber, stationCode } = useLocalSearchParams<{ lineNumber: string; stationCode: string }>();
  const [stops, setStops]     = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchRouteStops(stationCode, lineNumber)
      .then(setStops)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [lineNumber, stationCode]);

  const renderStop = ({ item, index }: { item: RouteStop; index: number }) => {
    const isCurrent = item.isCurrent || item.code === stationCode || item.id === stationCode;
    const isLast    = index === stops.length - 1;

    return (
      <TouchableOpacity
        style={styles.stopRow}
        onPress={() => router.push({ pathname: '/station/[code]', params: { code: item.code, name: item.name, lat: String(item.lat), lon: String(item.lon) } })}
        activeOpacity={0.7}
      >
        {/* קו אנכי */}
        <View style={styles.lineCol}>
          <View style={[styles.dot, isCurrent && styles.dotCurrent]} />
          {!isLast && <View style={[styles.vertLine, isCurrent && styles.vertLineCurrent]} />}
        </View>

        {/* תוכן */}
        <View style={[styles.stopContent, isCurrent && styles.stopContentCurrent]}>
          <Text style={[styles.stopName, isCurrent && styles.stopNameCurrent]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.stopCode}>תחנה {item.code}</Text>
        </View>

        {isCurrent && (
          <View style={styles.hereBadge}>
            <Text style={styles.hereText}>כאן</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.lineBadge}>
              <Text style={styles.lineNum}>{lineNumber}</Text>
            </View>
            <Text style={styles.title}>תחנות הקו</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        {loading && <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />}
        {error && <Text style={styles.error}>{error}</Text>}
        {!loading && !error && (
          <FlatList
            data={stops}
            keyExtractor={s => s.id}
            renderItem={renderStop}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          />
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
  bg:   { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: spacing.lg, marginBottom: spacing.lg,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeText:    { color: colors.text, fontSize: 16, fontWeight: '700' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  lineBadge: {
    backgroundColor: colors.accent, borderRadius: radius.sm,
    minWidth: 40, height: 32, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8,
  },
  lineNum: { color: '#000d28', fontSize: 16, fontWeight: '900' },
  title:   { fontSize: 17, fontWeight: '800', color: colors.text },
  list:    { paddingBottom: spacing.xl },

  stopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 0 },
  lineCol: { width: 28, alignItems: 'center' },
  dot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: colors.cardBorder,
    borderWidth: 2, borderColor: colors.cardBorder,
    marginTop: 14,
  },
  dotCurrent: { backgroundColor: colors.accent, borderColor: colors.accent, width: 16, height: 16, borderRadius: 8, marginTop: 12 },
  vertLine: { flex: 1, width: 2, backgroundColor: 'rgba(255,255,255,0.1)', minHeight: 30 },
  vertLineCurrent: { backgroundColor: colors.accent },
  stopContent: {
    flex: 1, paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    marginBottom: 2, borderRadius: radius.sm,
  },
  stopContentCurrent: { backgroundColor: 'rgba(96,165,250,0.08)' },
  stopName:        { fontSize: 14, fontWeight: '700', color: colors.textSub, textAlign: 'right' },
  stopNameCurrent: { color: colors.text, fontSize: 15 },
  stopCode:        { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2, textAlign: 'right' },
  hereBadge: {
    backgroundColor: colors.accent, borderRadius: radius.sm,
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 12, marginLeft: spacing.sm,
  },
  hereText: { color: '#000d28', fontSize: 11, fontWeight: '900' },
  error: { color: '#f87171', textAlign: 'center', marginTop: spacing.xl },
  navBar: {
    flexDirection: 'row', backgroundColor: colors.tabBar,
    borderTopColor: colors.tabBarBorder, borderTopWidth: 1, paddingTop: 8,
  },
  navItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  navEmoji: { fontSize: 20 },
  navLabel: { fontSize: 10, fontWeight: '700', color: colors.tabInactive },
});
