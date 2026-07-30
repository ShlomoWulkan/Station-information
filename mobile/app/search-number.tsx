import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StationRow } from '@/components/StationRow';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { commonStrings, searchStrings } from '@/constants/strings';
import { ScreenHeader } from '@/features/search/ScreenHeader';
import { styles } from '@/features/search/SearchNumber.styles';
import { useStationLookup } from '@/features/search/useStationLookup';
import { useA11y } from '@/hooks/useA11y';

export default function SearchNumberScreen() {
  const { font, c } = useA11y();
  const [code, setCode] = useState('');
  const { station, error, isLoading, canRetry, lookup } = useStationLookup();

  const submit = () => lookup(code);

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title={searchStrings.byNumberTitle} />

        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={submit}
            accessibilityRole="button"
            accessibilityLabel={commonStrings.search}
          >
            <Text style={[styles.searchBtnText, { fontSize: font(14) }]}>
              {commonStrings.search}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { fontSize: font(16), color: c.text }]}
            value={code}
            onChangeText={setCode}
            placeholder={searchStrings.byNumberPlaceholder}
            placeholderTextColor={c.textSub}
            keyboardType="number-pad"
            textAlign="right"
            onSubmitEditing={submit}
            accessibilityLabel={searchStrings.byNumberLabel}
          />
        </View>

        <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
          {isLoading && <LoadingState />}
          {error !== null && <ErrorState message={error} onRetry={canRetry ? submit : undefined} />}
          {station && <StationRow station={station} />}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
