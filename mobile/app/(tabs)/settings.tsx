import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { APP_VERSION } from '@/constants/config';
import { settingsStrings } from '@/constants/strings';
import { colors, radius, spacing } from '@/constants/theme';
import { useA11y } from '@/hooks/useA11y';

export default function SettingsScreen() {
  const { font, c } = useA11y();
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <Text style={[styles.title, { fontSize: font(22), color: c.text }]}>
          {settingsStrings.title}
        </Text>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => setPanelOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={settingsStrings.accessibility}
            accessibilityHint={settingsStrings.accessibilityHint}
          >
            <Text style={[styles.arrow, { fontSize: font(20) }]}>›</Text>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { fontSize: font(15), color: c.text }]}>
                ♿ {settingsStrings.accessibility}
              </Text>
              <Text style={[styles.cardSub, { fontSize: font(12), color: c.textSub }]}>
                {settingsStrings.accessibilityHint}
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={[styles.section, { fontSize: font(12), color: c.textSub }]}>
            {settingsStrings.privacy}
          </Text>
          <View style={styles.card}>
            <Text style={[styles.body, { fontSize: font(12), color: c.textSub }]}>
              {settingsStrings.privacyBody}
            </Text>
          </View>

          <Text style={[styles.section, { fontSize: font(12), color: c.textSub }]}>
            {settingsStrings.about}
          </Text>
          <View style={styles.card}>
            <Text style={[styles.body, { fontSize: font(12), color: c.textSub }]}>
              {settingsStrings.version(APP_VERSION)}
            </Text>
            <Text style={[styles.body, { fontSize: font(12), color: c.textSub }]}>
              {settingsStrings.dataSource}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      <AccessibilityPanel visible={panelOpen} onClose={() => setPanelOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  title: { fontWeight: '900', textAlign: 'right', paddingTop: spacing.lg },
  content: { paddingTop: spacing.md, paddingBottom: spacing.xl, gap: spacing.xs },
  section: { fontWeight: '700', textAlign: 'right', marginTop: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardText: { flex: 1, alignItems: 'flex-end' },
  cardTitle: { fontWeight: '800' },
  cardSub: { marginTop: 2, textAlign: 'right' },
  arrow: { color: colors.accent },
  body: { flex: 1, textAlign: 'right', lineHeight: 19 },
});
