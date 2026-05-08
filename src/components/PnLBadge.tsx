// ─────────────────────────────────────────────────────────────
// PnLBadge.tsx  –  Profit / Loss coloured badge
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../theme/theme';

interface Props {
  isProfit: boolean;
  label?: string; // default PROFIT / LOSS
}

const PnLBadge: React.FC<Props> = ({ isProfit, label }) => {
  const { palette } = useSettings();

  const color = isProfit ? palette.statusProfit : palette.statusLoss;
  const bg = isProfit ? palette.profitBg : palette.lossBg;
  const text = label ?? (isProfit ? 'PROFIT' : 'LOSS');

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: color + '50' },
      ]}
    >
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.bold,
    letterSpacing: 0.5,
  },
});

export default PnLBadge;
