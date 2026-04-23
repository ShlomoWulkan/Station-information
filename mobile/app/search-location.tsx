import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { StationRow } from '@/components/StationRow';
import { colors, spacing } from '@/constants/theme';
import { fetchNearbyStations } from '@/services/api';
import type { Station } from '@/types';

export default function SearchLocationScreen() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { handleSearch(); }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('נדרשת הרשאת מיקום');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const results = await fetchNearbyStations(loc.coords.latitude, loc.coords.longitude);
      setStations(results);
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
          <Text style={styles.title}>תחנות קרובות</Text>
          <TouchableOpacity onPress={handleSearch} style={styles.refreshBtn} disabled={loading}>
            <Text style={styles.refreshText}>🔄</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />}
        {error !== '' && <Text style={styles.error}>{error}</Text>}

        <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
          {!loading && stations.length === 0 && !error && (
            <Text style={styles.empty}>לא נמצאו תחנות בקרבת מקומך</Text>
          )}
          {stations.map(s => (
            <StationRow key={s.id} station={s} />
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
  title: { flex: 1, fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center' },
  refreshBtn: { padding: spacing.xs },
  refreshText: { fontSize: 18 },
  error: { color: '#f87171', textAlign: 'center', marginBottom: spacing.md },
  results: { flex: 1 },
  empty: { color: colors.textSub, textAlign: 'center', marginTop: spacing.xl, fontSize: 14 },
});
