const expo = require('eslint-config-expo/flat');
const tseslint = require('typescript-eslint');

module.exports = [
  ...expo,
  ...tseslint.configs.recommended,
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'expo-env.d.ts',
      'android/**',
      'ios/**',
      'eslint.config.js',
    ],
  },
  {
    rules: {
      // הכללים האלה תופסים בדיוק את סוגי הבאגים שנמצאו כאן ידנית.

      // catch {} ריק הסתיר כשלי רשת במפה וב-stores.
      'no-empty': ['error', { allowEmptyCatch: false }],

      // useEffect עם תלויות חסרות היה מקור לנתונים מיושנים ולריצות כפולות.
      'react-hooks/exhaustive-deps': 'error',

      // s.lat! על שדות אופציונליים במקום לצמצם את הטיפוס.
      '@typescript-eslint/no-non-null-assertion': 'warn',

      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // console.warn מכוון בכמה מקומות; log ו-error הם שאריות דיבוג.
      'no-console': ['warn', { allow: ['warn'] }],

      eqeqeq: ['error', 'always', { null: 'ignore' }],
    },
  },
];
