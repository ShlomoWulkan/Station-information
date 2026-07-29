import type { Href } from 'expo-router';
import { NEARBY_RADIUS_M } from '@/constants/config';
import { homeStrings } from '@/constants/strings';
import { iconGradients, neonColors } from '@/constants/theme';

export interface HomeMenuItem {
  key: string;
  icon: string;
  title: string;
  subtitle: string;
  neonColor: string;
  iconColors: readonly [string, string];
  href: Href;
  /** מפתח המונה להצגה בתג. */
  badge?: 'recent' | 'favorites';
}

/**
 * פריטי התפריט בעמוד הבית.
 *
 * כנתונים ולא כ-JSX, כדי שהמסך יישאר קצר ושהוספת פריט לא תדרוש נגיעה בפריסה.
 */
export const HOME_MENU: HomeMenuItem[] = [
  {
    key: 'location',
    icon: '📍',
    title: homeStrings.buttons.byLocation.title,
    subtitle: homeStrings.buttons.byLocation.subtitle(NEARBY_RADIUS_M),
    neonColor: neonColors.blue,
    iconColors: iconGradients.location,
    href: '/search-location',
  },
  {
    key: 'recent',
    icon: '🕐',
    title: homeStrings.buttons.recent.title,
    subtitle: homeStrings.buttons.recent.subtitle,
    neonColor: neonColors.cyan,
    iconColors: iconGradients.recent,
    href: '/recent',
    badge: 'recent',
  },
  {
    key: 'favorites',
    icon: '⭐',
    title: homeStrings.buttons.favorites.title,
    subtitle: homeStrings.buttons.favorites.subtitle,
    neonColor: neonColors.yellow,
    iconColors: iconGradients.star,
    href: '/(tabs)/favorites',
    badge: 'favorites',
  },
  {
    key: 'number',
    icon: '🔢',
    title: homeStrings.buttons.byNumber.title,
    subtitle: homeStrings.buttons.byNumber.subtitle,
    neonColor: neonColors.lightBlue,
    iconColors: iconGradients.number,
    href: '/search-number',
  },
  {
    key: 'map',
    icon: '🗺️',
    title: homeStrings.buttons.map.title,
    subtitle: homeStrings.buttons.map.subtitle,
    neonColor: neonColors.green,
    iconColors: iconGradients.map,
    href: '/(tabs)/map',
  },
];
