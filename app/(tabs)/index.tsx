import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { HomeButton } from '@/components/HomeButton';
import { LiveBadge } from '@/components/LiveBadge';
import { colors, spacing, neonColors, iconGradients } from '@/constants/theme';
import { useFavorites } from '@/store/favoritesStore';
import { useRecent } from '@/store/recentStore';

export default function HomeScreen() {
  const favCount = useFavorites(s => s.favorites.length);
  const recentCount = useRecent(s => s.recent.length);

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>מידע תחנה</Text>
            <Text style={styles.tagline}>זמני הגעת אוטובוסים · ישראל</Text>
          </View>
          <Text style={styles.busIcon}>🚌</Text>
        </View>

        <LiveBadge />
        <View style={styles.divider} />

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          <HomeButton
            icon="📍"
            title="חיפוש לפי מיקום"
            subtitle="תחנות עד 100 מטר"
            neonColor={neonColors.blue}
            iconColors={iconGradients.location}
            onPress={() => router.push('/search-location')}
          />
          <HomeButton
            icon="🕐"
            title="חיפושים אחרונים"
            subtitle="היסטוריה שמורה"
            neonColor={neonColors.cyan}
            iconColors={iconGradients.recent}
            badgeCount={recentCount > 0 ? recentCount : undefined}
            onPress={() => router.push('/recent')}
          />
          <HomeButton
            icon="⭐"
            title="מועדפים"
            subtitle="תחנות קבועות"
            neonColor={neonColors.yellow}
            iconColors={iconGradients.star}
            badgeCount={favCount > 0 ? favCount : undefined}
            onPress={() => router.push('/favorites')}
          />
          <HomeButton
            icon="🔢"
            title="מספר תחנה"
            subtitle="הקלד מספר ישירות"
            neonColor={neonColors.lightBlue}
            iconColors={iconGradients.number}
            onPress={() => router.push('/search-number')}
          />
          <HomeButton
            icon="🗺️"
            title="מפה אינטראקטיבית"
            subtitle="הצג תחנות מסביב"
            neonColor={neonColors.green}
            iconColors={iconGradients.map}
            onPress={() => router.push('/map')}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing.lg,
  },
  title: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.5, textAlign: 'right' },
  tagline: { fontSize: 10, color: colors.textMuted, marginTop: 3, textAlign: 'right' },
  busIcon: { fontSize: 34 },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginTop: spacing.lg,
    marginBottom: 4,
    opacity: 0.5,
  },
  list: { flex: 1 },
  listContent: { gap: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.lg },
});
