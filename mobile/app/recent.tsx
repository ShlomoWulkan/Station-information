import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StationRow } from '@/components/StationRow';
import { colors, spacing } from '@/constants/theme';
import { useRecent } from '@/store/recentStore';

export default function RecentScreen() {
  const { recent, clear, remove } = useRecent();

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>חיפושים אחרונים</Text>
        </View>

        {recent.length > 0 && (
          <TouchableOpacity onPress={() => Alert.alert('נקה היסטוריה', 'האם אתה בטוח שברצונך למחוק את כל החיפושים האחרונים?', [{ text: 'ביטול', style: 'cancel' }, { text: 'נקה', style: 'destructive', onPress: clear }])} style={styles.clearBtn}>
            <Text style={styles.clearIcon}>🗑</Text>
            <Text style={styles.clearText}>נקה היסטוריה</Text>
          </TouchableOpacity>
        )}

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {recent.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>🕐</Text>
              <Text style={styles.emptyText}>עדיין לא חיפשת תחנות</Text>
              <Text style={styles.emptySub}>חיפושים יישמרו כאן אוטומטית</Text>
            </View>
          ) : (
            recent.map(s => (
              <StationRow key={s.id} station={s} onDelete={() => remove(s.id)} />
            ))
          )}
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
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(248,113,113,0.1)',
    borderColor: 'rgba(248,113,113,0.35)',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: spacing.lg,
  },
  clearIcon: { fontSize: 15 },
  clearText: { color: '#f87171', fontSize: 13, fontWeight: '700' },
  list: { flex: 1 },
  emptyWrap: { alignItems: 'center', marginTop: 80, gap: spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  emptySub: { color: colors.textSub, fontSize: 13 },
});
