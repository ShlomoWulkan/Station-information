import { useCallback, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import { router } from 'expo-router';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { mapStrings } from '@/constants/strings';
import type { MapRegion } from '@/features/map/bounds';
import { MapBanner } from '@/features/map/MapBanner';
import { RecenterButton } from '@/features/map/RecenterButton';
import { StationMarker } from '@/features/map/StationMarker';
import { StationPopup } from '@/features/map/StationPopup';
import { useMapStations } from '@/features/map/useMapStations';
import { useUserLocation } from '@/features/map/useUserLocation';
import type { LocatedStation } from '@/types';

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [selected, setSelected] = useState<LocatedStation | null>(null);

  const location = useUserLocation();
  const { stations, error: stationsError, isZoomedOut, loadFor } = useMapStations();

  const recenter = useCallback(async () => {
    const region = await location.locate();
    if (!region) return;
    mapRef.current?.animateToRegion(region, 500);
    loadFor(region);
  }, [location, loadFor]);

  const openStation = (station: LocatedStation) => {
    setSelected(null);
    router.push({
      pathname: '/station/[code]',
      params: {
        code: station.code,
        name: station.name,
        lat: String(station.lat),
        lon: String(station.lon),
      },
    });
  };

  if (location.isLoading && location.region === null) {
    return <LoadingState label={mapStrings.loading} fullScreen />;
  }

  if (location.region === null) {
    return (
      <View style={styles.center}>
        <ErrorState message={location.error ?? mapStrings.loading} onRetry={() => void recenter()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={location.region}
        showsUserLocation
        showsMyLocationButton={false}
        onMapReady={() => loadFor(location.region as MapRegion)}
        onRegionChangeComplete={loadFor}
      >
        {stations.map((station) => (
          <StationMarker key={station.id} station={station} onPress={setSelected} />
        ))}
      </MapView>

      <RecenterButton onPress={() => void recenter()} disabled={location.isLoading} />

      {isZoomedOut && <MapBanner message={mapStrings.zoomInForStations} tone="info" />}
      {!isZoomedOut && stationsError !== null && <MapBanner message={stationsError} />}

      {selected && (
        <StationPopup station={selected} onOpen={openStation} onDismiss={() => setSelected(null)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: 'center' },
});
