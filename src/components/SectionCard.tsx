// ─────────────────────────────────────────────────────────────
// SectionCard.tsx  –  Themed container card
// ─────────────────────────────────────────────────────────────
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { RADIUS, SPACING } from '../theme/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

const SectionCard: React.FC<Props> = ({
  children,
  style,
  padding = SPACING.base,
}) => {
  const { palette } = useSettings();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.cardBg,
          borderColor: palette.cardBorder,
          padding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.base,
  },
});

export default SectionCard;
