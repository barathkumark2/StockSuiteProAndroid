// ─────────────────────────────────────────────────────────────
// ProfitLossScreen.tsx  –  P&L calculator (standard + reverse)
// ─────────────────────────────────────────────────────────────
import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NumericInput from '../components/NumericInput';
import SectionCard from '../components/SectionCard';
import StatCard from '../components/StatCard';
import PnLBadge from '../components/PnLBadge';
import { useSettings } from '../context/SettingsContext';
import {
  DEFAULT_PROFIT_LOSS,
  getItem,
  ProfitLossData,
  setItem,
  STORAGE_KEYS,
} from '../db/storage';
import { FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../theme/theme';

const ProfitLossScreen: React.FC = () => {
  const { palette, currency, decimals } = useSettings();
  const [data, setData] = useState<ProfitLossData>(DEFAULT_PROFIT_LOSS);
  const [reverseMode, setReverseMode] = useState(false);
  const [targetProfit, setTargetProfit] = useState(0);

  useEffect(() => {
    (async () => {
      const saved = await getItem<ProfitLossData>(
        STORAGE_KEYS.PROFIT_LOSS,
        DEFAULT_PROFIT_LOSS
      );
      setData(saved);
    })();
  }, []);

  const update = useCallback(async (patch: Partial<ProfitLossData>) => {
    setData((prev) => {
      const next = { ...prev, ...patch };
      setItem(STORAGE_KEYS.PROFIT_LOSS, next);
      return next;
    });
  }, []);

  const { buyPrice, sellPrice, quantity, brokerageFeePerShare, useBrokerage } =
    data;

  // ─── Calculations ─────────────────────────────────────────
  const totalInvestment = buyPrice * quantity;
  const grossPnL = (sellPrice - buyPrice) * quantity;
  const totalFees = useBrokerage ? brokerageFeePerShare * quantity * 2 : 0;
  const netPnL = grossPnL - totalFees;
  const roi =
    totalInvestment > 0 ? (netPnL / totalInvestment) * 100 : 0;
  const isProfit = netPnL >= 0;

  // Reverse calc
  let requiredSellPrice = 0;
  if (reverseMode && quantity > 0) {
    const desiredGross = targetProfit + totalFees;
    requiredSellPrice = desiredGross / quantity + buyPrice;
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: palette.appBg }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: palette.textPrimary }]}>
          Profit / Loss
        </Text>
        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: palette.textMuted }]}>
            Reverse Calculator
          </Text>
          <Switch
            value={reverseMode}
            onValueChange={setReverseMode}
            trackColor={{
              false: palette.inputBorder,
              true: palette.accentPrimary + '80',
            }}
            thumbColor={reverseMode ? palette.accentPrimary : palette.textMuted}
          />
        </View>
      </View>

      {/* Trade inputs */}
      <SectionCard>
        <NumericInput
          label={`Buy Price (${currency})`}
          value={data.buyPrice}
          onChangeValue={(v) => update({ buyPrice: v })}
          placeholder="0.00"
        />
        <NumericInput
          label="Quantity"
          value={data.quantity}
          onChangeValue={(v) => update({ quantity: v })}
          placeholder="0"
        />
        {!reverseMode ? (
          <NumericInput
            label={`Sell Price (${currency})`}
            value={data.sellPrice}
            onChangeValue={(v) => update({ sellPrice: v })}
            placeholder="0.00"
            style={{ marginBottom: 0 }}
          />
        ) : (
          <NumericInput
            label={`Target Net Profit (${currency})`}
            value={targetProfit}
            onChangeValue={setTargetProfit}
            placeholder="0.00"
            accent
            style={{ marginBottom: 0 }}
          />
        )}
      </SectionCard>

      {/* Brokerage section */}
      <SectionCard>
        <View style={styles.switchRow}>
          <View>
            <Text
              style={[styles.switchLabel2, { color: palette.textPrimary }]}
            >
              Include Brokerage Fees
            </Text>
            <Text style={[styles.hint, { color: palette.textMuted }]}>
              Applied on both buy and sell legs
            </Text>
          </View>
          <Switch
            value={data.useBrokerage}
            onValueChange={(v) => update({ useBrokerage: v })}
            trackColor={{
              false: palette.inputBorder,
              true: palette.accentPrimary + '80',
            }}
            thumbColor={
              data.useBrokerage ? palette.accentPrimary : palette.textMuted
            }
          />
        </View>
        {useBrokerage && (
          <NumericInput
            label={`Fee per Share (${currency})`}
            value={data.brokerageFeePerShare}
            onChangeValue={(v) => update({ brokerageFeePerShare: v })}
            placeholder="0.00"
            hint={`Total fees: ${currency}${totalFees.toFixed(2)}`}
            style={{ marginBottom: 0, marginTop: SPACING.md }}
          />
        )}
      </SectionCard>

      {/* Results */}
      <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
        {reverseMode ? 'Target Results' : 'Results'}
      </Text>

      {!reverseMode ? (
        <View
          style={[
            styles.resultsBox,
            {
              backgroundColor: isProfit ? palette.profitBg : palette.lossBg,
              borderColor: isProfit
                ? palette.statusProfit + '40'
                : palette.statusLoss + '40',
            },
          ]}
        >
          <View style={styles.statsGrid}>
            <StatCard
              label="Total Investment"
              value={`${currency}${totalInvestment.toFixed(2)}`}
              style={styles.statHalf}
            />
            <StatCard
              label="Gross P&L"
              value={`${grossPnL >= 0 ? '+' : ''}${currency}${grossPnL.toFixed(2)}`}
              valueColor={grossPnL >= 0 ? palette.statusProfit : palette.statusLoss}
              style={styles.statHalf}
            />
          </View>
          <View style={[styles.statsGrid, { marginTop: SPACING.sm }]}>
            <StatCard
              label="Net P&L"
              value={`${isProfit ? '+' : ''}${currency}${netPnL.toFixed(2)}`}
              valueColor={isProfit ? palette.statusProfit : palette.statusLoss}
              style={styles.statHalf}
            />
            <StatCard
              label="ROI"
              value={`${isProfit ? '+' : ''}${roi.toFixed(2)}%`}
              valueColor={isProfit ? palette.statusProfit : palette.statusLoss}
              style={styles.statHalf}
            />
          </View>
          <View style={{ marginTop: SPACING.sm }}>
            <PnLBadge isProfit={isProfit} />
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.resultsBox,
            {
              backgroundColor: palette.profitBg,
              borderColor: palette.statusProfit + '40',
            },
          ]}
        >
          <StatCard
            label="Required Sell Price"
            value={`${currency}${requiredSellPrice.toFixed(decimals)}`}
            valueColor={palette.statusProfit}
            subValue={
              useBrokerage
                ? `Accounting for ${currency}${totalFees.toFixed(2)} in total fees`
                : undefined
            }
            large
          />
          <View style={styles.hintRow}>
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={palette.textMuted}
            />
            <Text style={[styles.hint, { color: palette.textMuted }]}>
              Sell at this price with {quantity} shares for {currency}
              {targetProfit.toFixed(2)} net profit.
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: SPACING.base, paddingBottom: SPACING.xxxl },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  title: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  switchLabel: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.medium },
  switchLabel2: { fontSize: FONT_SIZES.base, fontWeight: FONT_WEIGHTS.medium },
  hint: { fontSize: FONT_SIZES.xs, marginTop: 2, lineHeight: 16 },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    marginBottom: SPACING.sm,
  },
  resultsBox: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.base,
  },
  statsGrid: { flexDirection: 'row', gap: SPACING.sm },
  statHalf: { flex: 1 },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: SPACING.sm,
  },
});

export default ProfitLossScreen;
