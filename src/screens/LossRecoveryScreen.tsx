// ─────────────────────────────────────────────────────────────
// LossRecoveryScreen.tsx  –  Loss asymmetry analyzer
// ─────────────────────────────────────────────────────────────
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NumericInput from '../components/NumericInput';
import SectionCard from '../components/SectionCard';
import StatCard from '../components/StatCard';
import ThemedProgressBar from '../components/ThemedProgressBar';
import { useSettings } from '../context/SettingsContext';
import {
  DEFAULT_LOSS_RECOVERY,
  getItem,
  LossRecoveryData,
  setItem,
  STORAGE_KEYS,
} from '../db/storage';
import { FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../theme/theme';

const LossRecoveryScreen: React.FC = () => {
  const { palette, currency } = useSettings();
  const [data, setData] = useState<LossRecoveryData>(DEFAULT_LOSS_RECOVERY);

  useEffect(() => {
    (async () => {
      const saved = await getItem<LossRecoveryData>(
        STORAGE_KEYS.LOSS_RECOVERY,
        DEFAULT_LOSS_RECOVERY
      );
      setData(saved);
    })();
  }, []);

  const update = useCallback(async (patch: Partial<LossRecoveryData>) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      setItem(STORAGE_KEYS.LOSS_RECOVERY, next);
      return next;
    });
  }, []);

  const { originalValue, currentValue } = data;

  let lossPercent = 0;
  let requiredGainPercent = 0;
  let isLoss = false;
  let isNoLoss = false;

  if (originalValue > 0 && currentValue > 0) {
    if (currentValue < originalValue) {
      isLoss = true;
      const lossAmount = originalValue - currentValue;
      lossPercent = (lossAmount / originalValue) * 100;
      requiredGainPercent = (lossAmount / currentValue) * 100;
    } else {
      isNoLoss = true;
    }
  }

  const progressValue = isLoss
    ? Math.min((currentValue / originalValue) * 100, 100)
    : 100;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: palette.appBg }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: palette.textPrimary }]}>
        Loss Asymmetry Analyzer
      </Text>

      <SectionCard>
        <NumericInput
          label={`Original Account Value (${currency})`}
          value={data.originalValue}
          onChangeValue={(v) => update({ originalValue: v })}
          placeholder="e.g. 10000"
        />
        <NumericInput
          label={`Current Value After Loss (${currency})`}
          value={data.currentValue}
          onChangeValue={(v) => update({ currentValue: v })}
          placeholder="e.g. 5000"
          style={{ marginBottom: 0 }}
        />
      </SectionCard>

      <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
        Recovery Profile
      </Text>

      {isNoLoss && (
        <View
          style={[
            styles.profitBox,
            {
              backgroundColor: palette.profitBg,
              borderColor: palette.statusProfit + '40',
            },
          ]}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={28}
            color={palette.statusProfit}
          />
          <Text style={[styles.profitText, { color: palette.statusProfit }]}>
            You are at break-even or in profit — no recovery needed!
          </Text>
        </View>
      )}

      {!isLoss && !isNoLoss && (
        <View
          style={[
            styles.emptyBox,
            {
              backgroundColor: palette.cardBg,
              borderColor: palette.cardBorder,
            },
          ]}
        >
          <Ionicons
            name="analytics-outline"
            size={36}
            color={palette.textMuted}
          />
          <Text style={[styles.emptyTxt, { color: palette.textMuted }]}>
            Enter your original and current account values to see the
            mathematical gap to break-even.
          </Text>
        </View>
      )}

      {isLoss && (
        <>
          {/* Progress bar */}
          <SectionCard>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressLabel, { color: palette.textMuted }]}>
                Current: {currency}
                {currentValue.toFixed(2)}
              </Text>
              <Text style={[styles.progressLabel, { color: palette.textMuted }]}>
                Break-Even: {currency}
                {originalValue.toFixed(2)}
              </Text>
            </View>
            <ThemedProgressBar
              progress={progressValue}
              color={palette.statusLoss}
            />
            <Text style={[styles.gap, { color: palette.statusLoss }]}>
              Gap to break-even: {currency}
              {(originalValue - currentValue).toFixed(2)}
            </Text>
          </SectionCard>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <StatCard
              label="Loss Incurred"
              value={`-${lossPercent.toFixed(2)}%`}
              valueColor={palette.statusLoss}
              style={styles.statHalf}
            />
            <View style={styles.statHalf}>
              <View
                style={[
                  styles.requiredBox,
                  {
                    backgroundColor: palette.cardBg,
                    borderColor: palette.accentPrimary + '40',
                  },
                ]}
              >
                <Text
                  style={[styles.requiredLabel, { color: palette.textMuted }]}
                >
                  Required Gain
                </Text>
                <Text
                  style={[styles.requiredValue, { color: palette.accentPrimary }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.5}
                >
                  +{requiredGainPercent.toFixed(2)}%
                </Text>
                <Text style={[styles.requiredHint, { color: palette.textMuted }]}>
                  to fully recover
                </Text>
              </View>
            </View>
          </View>

          {/* Asymmetry note */}
          <View
            style={[
              styles.asymmetryNote,
              {
                backgroundColor: palette.statusWarning + '10',
                borderColor: palette.statusWarning + '40',
              },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={palette.statusWarning}
            />
            <Text style={[styles.asymmetryText, { color: palette.statusWarning }]}>
              A {lossPercent.toFixed(1)}% loss requires a{' '}
              {requiredGainPercent.toFixed(1)}% gain to recover — this is the
              loss asymmetry effect.
            </Text>
          </View>
        </>
      )}
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
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.sm,
  },
  emptyBox: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  emptyTxt: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  profitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.base,
  },
  profitText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: 22,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  progressLabel: { fontSize: FONT_SIZES.xs },
  gap: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  statsGrid: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  statHalf: { flex: 1 },
  requiredBox: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.base,
    height: '100%',
    justifyContent: 'center',
  },
  requiredLabel: {
    fontSize: FONT_SIZES.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: FONT_WEIGHTS.medium,
    marginBottom: 4,
  },
  requiredValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.extrabold,
  },
  requiredHint: { fontSize: FONT_SIZES.xs, marginTop: 2 },
  asymmetryNote: {
    flexDirection: 'row',
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    alignItems: 'flex-start',
  },
  asymmetryText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    fontWeight: FONT_WEIGHTS.medium,
  },
});

export default LossRecoveryScreen;
