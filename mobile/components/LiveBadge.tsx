import { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { useA11y } from '@/hooks/useA11y';

export function LiveBadge() {
  const { reduceMotion, font } = useA11y();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduceMotion) { opacity.setValue(1); return; }
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.3, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
      ])
    ).start();
    return () => opacity.stopAnimation();
  }, [reduceMotion]);

  return (
    <View style={styles.badge}>
      <Animated.View style={[styles.dot, { opacity }]} />
      <Text style={[styles.text, { fontSize: font(10) }]}>עדכון בזמן אמת</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentBg,
    borderColor: colors.accentBorder,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.liveDot,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(180,210,255,0.8)',
  },
  // font size applied inline via useA11y
});
