// ─────────────────────────────────────────────────────────────
// NumericInput.tsx  –  Reusable labelled number input
// ─────────────────────────────────────────────────────────────
import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../theme/theme';

interface Props extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  label: string;
  value: number | string;
  onChangeValue: (n: number) => void;
  hint?: string;
  suffix?: string;
  accent?: boolean;
}

const NumericInput: React.FC<Props> = ({
  label,
  value,
  onChangeValue,
  hint,
  suffix,
  accent = false,
  ...rest
}) => {
  const { palette } = useSettings();

  const displayValue =
    value === 0 || value === '' ? '' : String(value);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: palette.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.row,
          {
            backgroundColor: palette.inputBg,
            borderColor: accent ? palette.accentPrimary : palette.inputBorder,
          },
        ]}
      >
        {suffix && (
          <Text style={[styles.suffix, { color: palette.textMuted }]}>
            {suffix}
          </Text>
        )}
        <TextInput
          style={[styles.input, { color: palette.textPrimary }]}
          value={displayValue}
          onChangeText={(txt) => {
            const n = parseFloat(txt);
            onChangeValue(isNaN(n) ? 0 : n);
          }}
          keyboardType="decimal-pad"
          placeholderTextColor={palette.textSecondary}
          placeholder="0"
          selectionColor={palette.accentPrimary}
          {...rest}
        />
      </View>
      {hint && (
        <Text style={[styles.hint, { color: palette.textMuted }]}>{hint}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: SPACING.md },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    height: 48,
  },
  suffix: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.regular,
    padding: 0,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    marginTop: SPACING.xs,
    lineHeight: 16,
  },
});

export default NumericInput;
