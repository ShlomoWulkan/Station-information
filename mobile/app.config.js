/**
 * קונפיג Expo. היה app.json, והומר ל-JS כדי שסודות יבואו ממשתני סביבה.
 *
 * מפתח Google Maps היה צרוב כאן ונדחף לרפו ציבורי. ראה docs/SECRETS.md
 * להגבלה ולסבב שלו, ולמודל העלות של Maps SDK.
 */

const IS_DEV = process.env.APP_VARIANT === 'development';

module.exports = {
  expo: {
    name: 'מידע תחנה',
    slug: 'midaa-tachana',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'midaatachana',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,

    plugins: [
      'expo-router',
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            'האפליקציה צריכה גישה למיקום כדי למצוא תחנות קרובות',
        },
      ],
    ],

    android: {
      package: 'com.midaatachana.app',
      adaptiveIcon: { backgroundColor: '#000d28' },
      permissions: [
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
      ],
      config: {
        googleMaps: { apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID },
      },
      // אנדרואיד 9+ חוסם HTTP גלוי. מותר בפיתוח בלבד, כדי שהיעדר HTTPS
      // ייכשל בבירור בבילד production ולא יגיע לחנות בשקט.
      usesCleartextTraffic: IS_DEV,
    },

    ios: {
      bundleIdentifier: 'com.midaatachana.app',
      infoPlist: {
        // מקביל ל-usesCleartextTraffic: ATS חוסם HTTP, ונפתח בפיתוח בלבד.
        NSAppTransportSecurity: { NSAllowsArbitraryLoads: IS_DEV },
      },
    },

    experiments: { typedRoutes: true },

    extra: {
      router: {},
      eas: { projectId: 'd1a271b1-1613-4397-b866-f36d4b506a49' },
    },
  },
};
