import { Modal, View, Text, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { a11yStrings } from '@/constants/strings';
import { spacing } from '@/constants/theme';
import { AccessibilityStatement } from '@/features/a11y/AccessibilityStatement';
import { TextSizePicker } from '@/features/a11y/TextSizePicker';
import { ToggleRow } from '@/features/a11y/ToggleRow';
import { useAccessibility } from '@/store/accessibilityStore';
import { styles } from './AccessibilityPanel.styles';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AccessibilityPanel({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const highContrast = useAccessibility((s) => s.highContrast);
  const reduceMotion = useAccessibility((s) => s.reduceMotion);
  const toggleHighContrast = useAccessibility((s) => s.toggleHighContrast);
  const toggleReduceMotion = useAccessibility((s) => s.toggleReduceMotion);
  const reset = useAccessibility((s) => s.reset);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* עוצר את המעבר של הלחיצה לשכבה שמתחת, שסוגרת את הפאנל */}
        <Pressable
          style={[styles.panel, { paddingBottom: insets.bottom + spacing.lg }]}
          onPress={() => {}}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              accessibilityLabel={a11yStrings.closePanel}
              accessibilityRole="button"
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{a11yStrings.title}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>{a11yStrings.textSizeSection}</Text>
            <TextSizePicker />

            <ToggleRow
              title={a11yStrings.highContrast}
              subtitle={a11yStrings.highContrastSub}
              value={highContrast}
              onChange={() => void toggleHighContrast()}
            />
            <ToggleRow
              title={a11yStrings.reduceMotion}
              subtitle={a11yStrings.reduceMotionSub}
              value={reduceMotion}
              onChange={() => void toggleReduceMotion()}
            />

            <Text style={styles.sectionTitle}>{a11yStrings.statementSection}</Text>
            <AccessibilityStatement />

            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => void reset()}
              accessibilityLabel={a11yStrings.reset}
              accessibilityRole="button"
            >
              <Text style={styles.resetText}>{a11yStrings.reset}</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
