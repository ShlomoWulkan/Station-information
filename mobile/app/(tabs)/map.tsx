import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { fetchStopsInBounds } from '@/services/api';
import { colors, spacing, radius } from '@/constants/theme';
import type { Station } from '@/types';

export default function MapScreen() {
  const [region, setRegion] = useState<Region | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [selected, setSelected] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapRef = useRef<MapView>(null);
  const fetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { init(); }, []);

  const init = async () => {
    setLoading(true);
    setError('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setError('נדרשת הרשאת מיקום'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      const initialRegion = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
      setRegion(initialRegion);
      await loadStops(initialRegion);
    } catch {
      setError('שגיאה בטעינת המפה');
    } finally {
      setLoading(false);
    }
  };

  const loadStops = async (r: Region) => {
    try {
      const results = await fetchStopsInBounds(
        r.latitude - r.latitudeDelta / 2,
        r.latitude + r.latitudeDelta / 2,
        r.longitude - r.longitudeDelta / 2,
        r.longitude + r.longitudeDelta / 2,
      );
      setStations(results);
    } catch {}
  };

  const onRegionChangeComplete = useCallback((r: Region) => {
    if (fetchTimer.current) clearTimeout(fetchTimer.current);
    fetchTimer.current = setTimeout(() => loadStops(r), 500);
  }, []);

  const openStation = (s: Station) => {
    router.push({ pathname: '/station/[code]', params: { code: s.code, name: s.name, lat: s.lat, lon: s.lon } });
    setSelected(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={styles.loadingText}>טוען מפה...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={init}>
          <Text style={styles.retryText}>נסה שוב</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton={false}
          onRegionChangeComplete={onRegionChangeComplete}
        >
          {stations.map(s => (
            <Marker
              key={s.id}
              coordinate={{ latitude: s.lat!, longitude: s.lon! }}
              tracksViewChanges={false}
              onPress={() => setSelected(s)}
            >
              <View style={styles.pin}>
                <Text style={styles.pinEmoji}>🚌</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      {selected && (
        <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      )}

      {selected && (
        <TouchableOpacity style={styles.popup} onPress={() => openStation(selected)} activeOpacity={0.85}>
          <Text style={styles.popupArrow}>›</Text>
          <View style={styles.popupInfo}>
            <Text style={styles.popupName}>{selected.name}</Text>
            <Text style={styles.popupCode}>תחנה {selected.code}</Text>
            <Text style={styles.popupHint}>לחץ לזמני הגעה</Text>
          </View>
          <Text style={styles.popupIcon}>🚌</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { color: colors.textSub, fontSize: 14, marginTop: spacing.sm },
  errorText: { color: '#f87171', fontSize: 14 },
  retryBtn: { backgroundColor: colors.accent, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  retryText: { color: '#000d28', fontWeight: '800', fontSize: 13 },
  pin: { alignItems: 'center', justifyContent: 'center' },
  pinEmoji: { fontSize: 26 },
  closeBtn: {
    position: 'absolute', top: 56, left: spacing.lg,
    backgroundColor: colors.card, borderRadius: 20,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  closeBtnText: { color: colors.textSub, fontSize: 14 },
  popup: {
    position: 'absolute', bottom: 32, left: spacing.lg, right: spacing.lg,
    backgroundColor: 'rgba(0,20,60,0.97)',
    borderColor: colors.accent, borderWidth: 1,
    borderRadius: radius.lg, padding: spacing.lg,
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
  },
  popupInfo: { flex: 1, alignItems: 'flex-end' },
  popupName: { fontSize: 16, fontWeight: '800', color: '#e8f0ff' },
  popupCode: { fontSize: 12, color: 'rgba(180,210,255,0.8)', marginTop: 2 },
  popupHint: { fontSize: 11, color: 'rgba(96,165,250,0.7)', marginTop: 4 },
  popupArrow: { fontSize: 22, color: colors.accent, fontWeight: '700' },
  popupIcon: { fontSize: 30 },
});
