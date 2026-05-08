// ─────────────────────────────────────────────────────────────
// StatCard.tsx  –  Summary stat display (label + value)
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../theme/theme';

interface Props {
  label: string;
  value: string;
  valueColor?: string;
  subValue?: string;
  style?: ViewStyle;
  large?: boolean;
}

const StatCard: React.FC<Props> = ({
  label,
  value,
  valueColor,
  subValue,
  style,
  large = false,
}) => {
  const { palette } = useSettings();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: palette.cardBg, borderColor: palette.cardBorder },
        style,
      ]}
    >
      <Text style={[styles.label, { color: palette.textMuted }]}>{label}</Text>
      <Text
        style={[
          large ? styles.valueLarge : styles.value,
          { color: valueColor ?? palette.textPrimary },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {value}
      </Text>
      {subValue && (
        <Text style={[styles.sub, { color: palette.textMuted }]}>
          {subValue}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.base,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  value: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  valueLarge: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: FONT_WEIGHTS.extrabold,
  },
  sub: {
    fontSize: FONT_SIZES.sm,
    marginTop: 2,
  },
});

export default StatCard;
