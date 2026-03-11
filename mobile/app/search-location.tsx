import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { StationCard } from '@/components/StationCard';
import { colors, spacing, radius } from '@/constants/theme';
import { getNearbyStations, getArrivals, USE_MOCK } from '@/services/mockData';
import type { Station } from '@/types';

export default function SearchLocationScreen() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      if (!USE_MOCK) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('נדרשת הרשאת מיקום');
          return;
        }
      }
      const results = getNearbyStations();
      setStations(results);
      setSearched(true);
    } catch {
      setError('שגיאה בקבלת מיקום');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>חיפוש לפי מיקום</Text>
        </View>

        <TouchableOpacity style={styles.gpsBtn} onPress={handleSearch} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#000d28" />
            : <Text style={styles.gpsBtnText}>📍  מצא תחנות קרובות</Text>
          }
        </TouchableOpacity>

        {error !== '' && <Text style={styles.error}>{error}</Text>}

        <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
          {searched && stations.length === 0 && (
            <Text style={styles.empty}>לא נמצאו תחנות בקרבת מקומך</Text>
          )}
          {stations.map(s => (
            <StationCard key={s.id} station={s} arrivals={getArrivals(s.code)} />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.lg, marginBottom: spacing.xl },
  backBtn: { marginLeft: spacing.md, padding: spacing.xs },
  backText: { color: colors.textSub, fontSize: 18 },
  title: { flex: 1, fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'right' },
  gpsBtn: {
    backgroundColor: colors.accent, borderRadius: radius.lg,
    padding: spacing.lg, alignItems: 'center', marginBottom: spacing.lg,
  },
  gpsBtnText: { color: '#000d28', fontWeight: '800', fontSize: 15 },
  error: { color: '#f87171', textAlign: 'center', marginBottom: spacing.md },
  results: { flex: 1 },
  empty: { color: colors.textSub, textAlign: 'center', marginTop: spacing.xl, fontSize: 14 },
});
