import { Modal, View, Text, TouchableOpacity, Pressable, ScrollView, StyleSheet, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessibility, type TextScale } from '@/store/accessibilityStore';
import { colors, spacing, radius } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const TEXT_SIZES: { label: string; value: TextScale }[] = [
  { label: 'רגיל', value: 1 },
  { label: 'גדול', value: 1.2 },
  { label: 'גדול מאוד', value: 1.5 },
];

export function AccessibilityPanel({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { textScale, highContrast, reduceMotion, setTextScale, toggleHighContrast, toggleReduceMotion, reset } = useAccessibility();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.panel, { paddingBottom: insets.bottom + spacing.lg }]} onPress={() => {}}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="סגור פאנל נגישות" accessibilityRole="button">
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>♿ נגישות</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Text Size */}
            <Text style={styles.sectionTitle}>גודל טקסט</Text>
            <View style={styles.textSizeRow}>
              {TEXT_SIZES.map(({ label, value }) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.sizeBtn, textScale === value && styles.sizeBtnActive]}
                  onPress={() => setTextScale(value)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: textScale === value }}
                  accessibilityLabel={`גודל טקסט ${label}`}
                >
                  <Text style={[styles.sizeBtnText, { fontSize: 13 * value }, textScale === value && styles.sizeBtnTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* High Contrast */}
            <View style={styles.row}>
              <Switch
                value={highContrast}
                onValueChange={toggleHighContrast}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.accent }}
                thumbColor="#fff"
                accessibilityLabel="ניגודיות גבוהה"
                accessibilityRole="switch"
                accessibilityState={{ checked: highContrast }}
              />
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>ניגודיות גבוהה</Text>
                <Text style={styles.rowSub}>מגביר את הניגוד בין טקסט לרקע</Text>
              </View>
            </View>

            {/* Reduce Motion */}
            <View style={styles.row}>
              <Switch
                value={reduceMotion}
                onValueChange={toggleReduceMotion}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.accent }}
                thumbColor="#fff"
                accessibilityLabel="הפחתת תנועה"
                accessibilityRole="switch"
                accessibilityState={{ checked: reduceMotion }}
              />
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>הפחתת תנועה</Text>
                <Text style={styles.rowSub}>מבטל אנימציות ואפקטים נעים</Text>
              </View>
            </View>

            {/* Accessibility Statement */}
            <Text style={styles.sectionTitle}>הצהרת נגישות</Text>
            <View style={styles.statementBox}>
              <Text style={styles.statementText}>
                אפליקציה זו עומדת ברמת נגישות AA בהתאם לתקן WCAG 2.1 ולחוק שוויון זכויות לאנשים עם מוגבלות (תשנ"ח-1998).
              </Text>
              <Text style={styles.statementText}>
                לפניות בנושא נגישות ניתן לפנות לכתובת: ptsupport@mot.gov.il
              </Text>
              <Text style={styles.statementDate}>עדכון אחרון: מרץ 2026</Text>
            </View>

            {/* Reset */}
            <TouchableOpacity style={styles.resetBtn} onPress={reset} accessibilityLabel="אפס הגדרות נגישות" accessibilityRole="button">
              <Text style={styles.resetText}>אפס הגדרות נגישות</Text>
            </TouchableOpacity>

          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  panel: {
    backgroundColor: '#001230',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.accentBorder,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    maxHeight: '85%',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  closeText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  title: { flex: 1, fontSize: 20, fontWeight: '900', color: colors.text, textAlign: 'right' },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: colors.textSub, textAlign: 'right', marginBottom: spacing.sm, marginTop: spacing.md },
  textSizeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  sizeBtn: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  sizeBtnActive: { borderColor: colors.accent, backgroundColor: colors.accentBg },
  sizeBtnText: { color: colors.textSub, fontWeight: '700' },
  sizeBtnTextActive: { color: colors.accent },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  rowInfo: { flex: 1, alignItems: 'flex-end' },
  rowTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  rowSub: { fontSize: 12, color: colors.textSub, marginTop: 2 },
  statementBox: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1,
    borderColor: colors.cardBorder, padding: spacing.md, gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statementText: { fontSize: 12, color: colors.textSub, textAlign: 'right', lineHeight: 18 },
  statementDate: { fontSize: 11, color: 'rgba(180,210,255,0.3)', textAlign: 'right' },
  resetBtn: {
    borderWidth: 1, borderColor: 'rgba(248,113,113,0.3)', borderRadius: radius.md,
    paddingVertical: spacing.md, alignItems: 'center', marginBottom: spacing.md,
  },
  resetText: { color: '#f87171', fontSize: 13, fontWeight: '700' },
});
