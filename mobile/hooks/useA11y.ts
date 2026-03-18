import { useAccessibility } from '@/store/accessibilityStore';
import { colors } from '@/constants/theme';

const highContrastColors = {
  ...colors,
  text: '#ffffff',
  textSub: 'rgba(255,255,255,0.75)',
  textMuted: 'rgba(255,255,255,0.5)',
  card: 'rgba(255,255,255,0.12)',
  cardBorder: 'rgba(255,255,255,0.4)',
  tabInactive: 'rgba(255,255,255,0.6)',
};

export function useA11y() {
  const { textScale, highContrast, reduceMotion } = useAccessibility();

  return {
    font: (size: number) => Math.round(size * textScale),
    c: highContrast ? highContrastColors : colors,
    reduceMotion,
  };
}
