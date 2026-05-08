// ─────────────────────────────────────────────────────────────
// SettingsScreen.tsx  –  App preferences
// ─────────────────────────────────────────────────────────────
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SectionCard from '../components/SectionCard';
import { useSettings } from '../context/SettingsContext';
import type { ThemeKey } from '../theme/theme';
import { FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../theme/theme';

// ─── Constants ────────────────────────────────────────────────
const CURRENCY_OPTIONS = [
  { label: 'USD ($)', value: '$' },
  { label: 'EUR (€)', value: '€' },
  { label: 'GBP (£)', value: '£' },
  { label: 'INR (₹)', value: '₹' },
  { label: 'JPY (¥)', value: '¥' },
  { label: 'AUD (A$)', value: 'A$' },
  { label: 'CAD (C$)', value: 'C$' },
];

const THEME_OPTIONS: { label: string; value: ThemeKey; icon: any }[] = [
  { label: 'Dark', value: 'dark', icon: 'moon-outline' },
  { label: 'Black (AMOLED)', value: 'black', icon: 'phone-portrait-outline' },
  { label: 'Light', value: 'light', icon: 'sunny-outline' },
];

const DECIMAL_OPTIONS = [
  { label: '0', value: 0 },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
];

// ─── Component ────────────────────────────────────────────────
const SettingsScreen: React.FC = () => {
  const { palette, currency, theme, decimals, setCurrency, setTheme, setDecimals } =
    useSettings();

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[styles.sectionHeader, { color: palette.textMuted }]}>
      {title}
    </Text>
  );

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: palette.appBg }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: palette.textPrimary }]}>
        Settings
      </Text>

      {/* ── Theme ─────────────────────────────────────────── */}
      <SectionHeader title="APPEARANCE" />
      <SectionCard padding={0}>
        {THEME_OPTIONS.map((opt, i) => {
          const isSelected = theme === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setTheme(opt.value)}
              style={[
                styles.optionRow,
                i < THEME_OPTIONS.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: palette.divider,
                },
              ]}
            >
              <View style={styles.optionLeft}>
                <Ionicons
                  name={opt.icon}
                  size={20}
                  color={isSelected ? palette.accentPrimary : palette.textMuted}
                />
                <Text
                  style={[
                    styles.optionLabel,
                    { color: isSelected ? palette.textPrimary : palette.textSecondary },
                  ]}
                >
                  {opt.label}
                </Text>
              </View>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={palette.accentPrimary}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </SectionCard>

      {/* ── Currency ──────────────────────────────────────── */}
      <SectionHeader title="LOCALIZATION" />
      <SectionCard padding={0}>
        {CURRENCY_OPTIONS.map((opt, i) => {
          const isSelected = currency === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setCurrency(opt.value)}
              style={[
                styles.optionRow,
                i < CURRENCY_OPTIONS.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: palette.divider,
                },
              ]}
            >
              <View style={styles.optionLeft}>
                <Text
                  style={[
                    styles.currencySymbol,
                    {
                      color: isSelected
                        ? palette.accentPrimary
                        : palette.textMuted,
                    },
                  ]}
                >
                  {opt.value}
                </Text>
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      color: isSelected
                        ? palette.textPrimary
                        : palette.textSecondary,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </View>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={palette.accentPrimary}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </SectionCard>

      {/* ── Decimals ──────────────────────────────────────── */}
      <SectionHeader title="DECIMAL PRECISION" />
      <SectionCard>
        <Text style={[styles.decimalsHint, { color: palette.textMuted }]}>
          Number of decimal places in calculations
        </Text>
        <View style={styles.decimalGrid}>
          {DECIMAL_OPTIONS.map((opt) => {
            const isSelected = decimals === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setDecimals(opt.value)}
                style={[
                  styles.decimalChip,
                  {
                    backgroundColor: isSelected
                      ? palette.accentPrimary
                      : palette.inputBg,
                    borderColor: isSelected
                      ? palette.accentPrimary
                      : palette.inputBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.decimalChipTxt,
                    {
                      color: isSelected
                        ? '#ffffff'
                        : palette.textSecondary,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SectionCard>

      {/* ── App info ──────────────────────────────────────── */}
      <SectionHeader title="ABOUT" />
      <SectionCard>
        <View style={styles.aboutRow}>
          <Ionicons
            name="trending-up-outline"
            size={24}
            color={palette.accentPrimary}
          />
          <View>
            <Text style={[styles.appName, { color: palette.textPrimary }]}>
              StockSuite Pro
            </Text>
            <Text style={[styles.appVersion, { color: palette.textMuted }]}>
              Version 1.0.0 · Android
            </Text>
          </View>
        </View>
        <Text style={[styles.appDesc, { color: palette.textMuted }]}>
          A professional stock portfolio manager and calculator suite. All data
          is stored locally on your device — no account needed.
        </Text>
      </SectionCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: SPACING.base, paddingBottom: SPACING.xxxl },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.base,
  },
  sectionHeader: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  optionLabel: { fontSize: FONT_SIZES.base, fontWeight: FONT_WEIGHTS.medium },
  currencySymbol: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    width: 24,
    textAlign: 'center',
  },
  decimalsHint: {
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.md,
  },
  decimalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  decimalChip: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs + 2,
    minWidth: 48,
    alignItems: 'center',
  },
  decimalChipTxt: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  appName: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold },
  appVersion: { fontSize: FONT_SIZES.sm, marginTop: 2 },
  appDesc: { fontSize: FONT_SIZES.sm, lineHeight: 20 },
});

export default SettingsScreen;
