import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing } from '@/constants/theme';

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  neonColor: string;
  iconColors: readonly [string, string];
  badgeCount?: number;
  onPress: () => void;
}

export function HomeButton({ icon, title, subtitle, neonColor, iconColors, badgeCount, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.neon, { backgroundColor: neonColor }]} />
      <LinearGradient colors={iconColors} style={styles.iconWrap} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={styles.iconText}>{icon}</Text>
      </LinearGradient>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      {badgeCount !== undefined ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      ) : (
        <Text style={styles.arrow}>›</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    overflow: 'hidden',
  },
  neon: {
    position: 'absolute',
    right: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderRadius: 3,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 18 },
  textWrap: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: colors.text, textAlign: 'right' },
  subtitle: { fontSize: 10, color: colors.textSub, marginTop: 2, textAlign: 'right' },
  arrow: { fontSize: 18, color: 'rgba(180,210,255,0.2)' },
  badge: {
    backgroundColor: colors.badgeBg,
    borderColor: colors.badgeBorder,
    borderWidth: 1,
    borderRadius: radius.full,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: colors.badge, fontSize: 10, fontWeight: '700' },
});
