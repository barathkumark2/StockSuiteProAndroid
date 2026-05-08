// ─────────────────────────────────────────────────────────────
// TargetAverageScreen.tsx  –  Average-down / up planner
// ─────────────────────────────────────────────────────────────
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NumericInput from '../components/NumericInput';
import SectionCard from '../components/SectionCard';
import StatCard from '../components/StatCard';
import { useSettings } from '../context/SettingsContext';
import {
  DEFAULT_TARGET_AVG,
  getItem,
  setItem,
  STORAGE_KEYS,
  TargetAvgData,
} from '../db/storage';
import { FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../theme/theme';

const TargetAverageScreen: React.FC = () => {
  const { palette, currency, decimals } = useSettings();
  const [data, setData] = useState<TargetAvgData>(DEFAULT_TARGET_AVG);

  useEffect(() => {
    (async () => {
      const saved = await getItem<TargetAvgData>(
        STORAGE_KEYS.TARGET_AVG,
        DEFAULT_TARGET_AVG
      );
      setData(saved);
    })();
  }, []);

  const update = useCallback(
    async (patch: Partial<TargetAvgData>) => {
      setData((prev) => {
        const next = { ...prev, ...patch };
        setItem(STORAGE_KEYS.TARGET_AVG, next);
        return next;
      });
    },
    []
  );

  const { currentAvg, currentShares, targetAvg, cmp } = data;

  // ─── Core logic (mirrors web) ──────────────────────────────
  let sharesToBuy = 0;
  let isValid = false;
  let message = '';

  if (currentShares > 0 && currentAvg > 0 && targetAvg > 0 && cmp > 0) {
    if (currentAvg === targetAvg) {
      message = 'Current average is already at the target.';
    } else if (currentAvg > targetAvg && cmp >= targetAvg) {
      message =
        'To average down, CMP must be strictly less than the Target Average.';
    } else if (currentAvg < targetAvg && cmp <= targetAvg) {
      message =
        'To average up, CMP must be strictly greater than the Target Average.';
    } else {
      sharesToBuy =
        (currentShares * (currentAvg - targetAvg)) / (targetAvg - cmp);
      if (sharesToBuy > 0) {
        isValid = true;
      } else {
        message = 'Target cannot be reached with the given inputs.';
      }
    }
  }

  const additionalInvestment = sharesToBuy * cmp;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: palette.appBg }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.title, { color: palette.textPrimary }]}>
        Average Down / Up Planner
      </Text>

      <SectionCard>
        <NumericInput
          label={`Current Average Price (${currency})`}
          value={data.currentAvg}
          onChangeValue={(v) => update({ currentAvg: v })}
          placeholder="e.g. 150.00"
        />
        <NumericInput
          label="Current Total Shares"
          value={data.currentShares}
          onChangeValue={(v) => update({ currentShares: v })}
          placeholder="e.g. 100"
        />
        <NumericInput
          label={`Desired Target Average (${currency})`}
          value={data.targetAvg}
          onChangeValue={(v) => update({ targetAvg: v })}
          placeholder="e.g. 140.00"
        />
        <NumericInput
          label={`CMP – Current Market Price (${currency})`}
          value={data.cmp}
          onChangeValue={(v) => update({ cmp: v })}
          placeholder="e.g. 130.00"
          style={{ marginBottom: 0 }}
        />
      </SectionCard>

      {/* Result card */}
      <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
        Action Required
      </Text>

      {!isValid && message ? (
        <View
          style={[
            styles.alertBox,
            {
              backgroundColor: palette.statusWarning + '15',
              borderColor: palette.statusWarning + '50',
            },
          ]}
        >
          <Ionicons
            name="warning-outline"
            size={18}
            color={palette.statusWarning}
          />
          <Text style={[styles.alertText, { color: palette.statusWarning }]}>
            {message}
          </Text>
        </View>
      ) : null}

      {!isValid && !message ? (
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
            name="calculator-outline"
            size={36}
            color={palette.textMuted}
          />
          <Text style={[styles.emptyTxt, { color: palette.textMuted }]}>
            Enter values above to calculate the required shares to reach your
            target average.
          </Text>
        </View>
      ) : null}

      {isValid && (
        <>
          <View style={styles.statsGrid}>
            <StatCard
              label="Shares to Buy"
              value={Math.ceil(sharesToBuy).toLocaleString()}
              subValue={`Exact: ${sharesToBuy.toFixed(decimals)}`}
              valueColor={palette.textPrimary}
              style={styles.statHalf}
            />
            <StatCard
              label="Additional Investment"
              value={`${currency}${additionalInvestment.toLocaleString(
                undefined,
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}`}
              valueColor={palette.accentPrimary}
              style={styles.statHalf}
            />
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
    marginTop: SPACING.xs,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.base,
  },
  alertText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    fontWeight: FONT_WEIGHTS.medium,
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
  statsGrid: { flexDirection: 'row', gap: SPACING.sm },
  statHalf: { flex: 1 },
});

export default TargetAverageScreen;
