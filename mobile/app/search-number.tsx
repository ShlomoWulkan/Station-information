import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StationRow } from '@/components/StationRow';
import { colors, spacing, radius } from '@/constants/theme';
import { fetchStation } from '@/services/api';
import type { Station } from '@/types';

export default function SearchNumberScreen() {
  const [code, setCode] = useState('');
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setStation(null);
    try {
      const s = await fetchStation(trimmed);
      setStation(s);
    } catch {
      setError(`תחנה ${trimmed} לא נמצאה`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>חיפוש לפי מספר תחנה</Text>
        </View>

        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>חפש</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="מספר תחנה..."
            placeholderTextColor={colors.textSub}
            keyboardType="number-pad"
            textAlign="right"
            onSubmitEditing={handleSearch}
          />
        </View>

        <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
          {loading && <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />}
          {error && <Text style={styles.notFound}>{error}</Text>}
          {station && <StationRow station={station} />}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.lg, marginBottom: spacing.xl },
  backBtn: { marginLeft: spacing.md, padding: spacing.xs },
  backText: { color: colors.textSub, fontSize: 18 },
  title: { flex: 1, fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'right' },
  inputRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  input: {
    flex: 1, backgroundColor: colors.card, borderColor: colors.cardBorder,
    borderWidth: 1, borderRadius: radius.md, padding: spacing.md,
    color: colors.text, fontSize: 16,
  },
  searchBtn: {
    backgroundColor: colors.accent, borderRadius: radius.md,
    paddingHorizontal: spacing.lg, justifyContent: 'center',
  },
  searchBtnText: { color: '#000d28', fontWeight: '800', fontSize: 14 },
  results: { flex: 1 },
  notFound: { color: colors.textSub, textAlign: 'center', marginTop: spacing.xl, fontSize: 14 },
});
