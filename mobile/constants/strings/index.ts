/**
 * כל הטקסטים הגלויים למשתמש במקום אחד, מחולקים לפי דומיין.
 *
 * הסיבה: טקסט צרוב בתוך JSX קשה לאתר, קל לשכפל בנוסח שונה, ואי אפשר לתרגם.
 * הפרדה גם מקצרת את קבצי הקומפוננטות.
 */
export { commonStrings } from './common';
export { errorStrings } from './errors';
export { stationStrings } from './station';
export { searchStrings, mapStrings } from './search';
export { a11yStrings } from './a11y';
export {
  homeStrings,
  favoritesStrings,
  recentStrings,
  settingsStrings,
  notFoundStrings,
} from './home';
