import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { HomeButton } from '@/components/HomeButton';
import { commonStrings } from '@/constants/strings';
import { styles } from '@/features/home/HomeScreen.styles';
import { HOME_MENU } from '@/features/home/menuItems';
import { useA11y } from '@/hooks/useA11y';
import { useFavorites } from '@/store/favoritesStore';
import { useRecent } from '@/store/recentStore';

export default function HomeScreen() {
  const { font, c } = useA11y();
  const favoritesCount = useFavorites((s) => s.favorites.length);
  const recentCount = useRecent((s) => s.recent.length);

  const badgeCount = (badge?: 'recent' | 'favorites'): number | undefined => {
    const count = badge === 'recent' ? recentCount : badge === 'favorites' ? favoritesCount : 0;
    return count > 0 ? count : undefined;
  };

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.busIconWrap}>
            <Text style={{ fontSize: font(28) }}>🚌</Text>
          </View>
          <View>
            <Text style={[styles.title, { fontSize: font(22), color: c.text }]}>
              {commonStrings.appName}
            </Text>
            <Text style={[styles.tagline, { fontSize: font(10), color: c.textMuted }]}>
              {commonStrings.tagline}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {HOME_MENU.map((item) => (
            <HomeButton
              key={item.key}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              neonColor={item.neonColor}
              iconColors={item.iconColors}
              badgeCount={badgeCount(item.badge)}
              onPress={() => router.push(item.href)}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
