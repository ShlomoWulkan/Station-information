import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { HomeButton } from '@/components/HomeButton';
import { LiveBadge } from '@/components/LiveBadge';
import { colors, spacing, neonColors, iconGradients } from '@/constants/theme';
import { useFavorites } from '@/store/favoritesStore';
import { useRecent } from '@/store/recentStore';
import { useA11y } from '@/hooks/useA11y';

export default function HomeScreen() {
  const favCount = useFavorites(s => s.favorites.length);
  const recentCount = useRecent(s => s.recent.length);
  const { font, c } = useA11y();

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.busIconWrap}>
            <Text style={styles.busIcon}>🚌</Text>
          </View>
          <View>
            <Text style={[styles.title, { fontSize: font(22), color: c.text }]}>מידע תחנה</Text>
            <Text style={[styles.tagline, { fontSize: font(10), color: c.textMuted }]}>זמני הגעת אוטובוסים · ישראל</Text>
            <LiveBadge />
          </View>
        </View>

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
  busIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: '#1d4ed8',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#0ea5e9', shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  busIcon: { fontSize: 28 },
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
