import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StationRow } from '@/components/StationRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/features/search/ScreenHeader';
import { commonStrings, recentStrings } from '@/constants/strings';
import { colors, spacing } from '@/constants/theme';
import { useA11y } from '@/hooks/useA11y';
import { useRecent } from '@/store/recentStore';

export default function RecentScreen() {
  const recent = useRecent((s) => s.recent);
  const clear = useRecent((s) => s.clear);
  const remove = useRecent((s) => s.remove);
  const { font } = useA11y();

  const confirmClear = () =>
    Alert.alert(recentStrings.clearConfirmTitle, recentStrings.clearConfirmBody, [
      { text: commonStrings.cancel, style: 'cancel' },
      { text: recentStrings.clearConfirmAction, style: 'destructive', onPress: clear },
    ]);

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title={recentStrings.title} />

        {recent.length > 0 && (
          <TouchableOpacity
            onPress={confirmClear}
            style={styles.clearBtn}
            accessibilityRole="button"
            accessibilityLabel={recentStrings.clear}
          >
            <Text style={{ fontSize: font(15) }}>🗑</Text>
            <Text style={[styles.clearText, { fontSize: font(13) }]}>{recentStrings.clear}</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={recent}
          keyExtractor={(station) => station.id}
          renderItem={({ item }) => (
            <StationRow station={item} onDelete={() => remove(item.id)} />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="🕐"
              title={recentStrings.emptyTitle}
              subtitle={recentStrings.emptySubtitle}
            />
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: spacing.lg,
  },
  clearText: { color: colors.error, fontWeight: '700' },
});
