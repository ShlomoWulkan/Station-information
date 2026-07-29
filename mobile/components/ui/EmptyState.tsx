import { View, Text } from 'react-native';
import { useA11y } from '@/hooks/useA11y';
import { styles } from './EmptyState.styles';

interface Props {
  /** אימוג'י גדול. מושמט בהודעות ריק קצרות בתוך רשימה. */
  icon?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: Props) {
  const { font, c } = useA11y();

  return (
    <View style={icon ? styles.wrapLarge : styles.wrapInline}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text
        style={[
          icon ? styles.title : styles.inlineTitle,
          { fontSize: font(icon ? 16 : 14), color: icon ? c.text : c.textSub },
        ]}
      >
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.subtitle, { fontSize: font(13), color: c.textSub }]}>{subtitle}</Text>
      )}
    </View>
  );
}
