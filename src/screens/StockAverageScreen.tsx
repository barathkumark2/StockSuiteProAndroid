// ─────────────────────────────────────────────────────────────
// StockAverageScreen.tsx  –  Multi-tranche average calculator
// ─────────────────────────────────────────────────────────────
import * as Clipboard from 'expo-clipboard';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NumericInput from '../components/NumericInput';
import SectionCard from '../components/SectionCard';
import StatCard from '../components/StatCard';
import { useSettings } from '../context/SettingsContext';
import {
  getItem,
  setItem,
  STORAGE_KEYS,
  Tranche,
} from '../db/storage';
import {
  FONT_SIZES,
  FONT_WEIGHTS,
  RADIUS,
  SPACING,
} from '../theme/theme';

const makeBlankTranche = (): Tranche => ({
  id: Crypto.randomUUID(),
  buyPrice: 0,
  quantity: 0,
});

const StockAverageScreen: React.FC = () => {
  const { palette, currency, decimals } = useSettings();
  const [tranches, setTranches] = useState<Tranche[]>([makeBlankTranche()]);
  const [copied, setCopied] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    (async () => {
      const saved = await getItem<Tranche[]>(STORAGE_KEYS.TRANCHES, [
        makeBlankTranche(),
      ]);
      if (saved.length === 0) {
        setTranches([makeBlankTranche()]);
      } else {
        setTranches(saved);
      }
    })();
  }, []);

  // Persist whenever tranches change
  const persist = useCallback(async (data: Tranche[]) => {
    await setItem(STORAGE_KEYS.TRANCHES, data);
  }, []);

  const updateTranche = useCallback(
    (id: string, field: keyof Tranche, val: number) => {
      setTranches((prev) => {
        const next = prev.map((t) =>
          t.id === id ? { ...t, [field]: val } : t
        );
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const addRow = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTranches((prev) => {
      const next = [...prev, makeBlankTranche()];
      persist(next);
      return next;
    });
  }, [persist]);

  const removeRow = useCallback(
    async (id: string) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setTranches((prev) => {
        const filtered = prev.filter((t) => t.id !== id);
        const next = filtered.length === 0 ? [makeBlankTranche()] : filtered;
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const resetAll = () => {
    Alert.alert('Reset All', 'Clear all tranches?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          const fresh = [makeBlankTranche()];
          setTranches(fresh);
          await persist(fresh);
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning
          );
        },
      },
    ]);
  };

  // ─── Calculations ──────────────────────────────────────────
  const totalShares = tranches.reduce(
    (s, t) => s + (Number(t.quantity) || 0),
    0
  );
  const totalInvestment = tranches.reduce(
    (s, t) => s + (Number(t.buyPrice) || 0) * (Number(t.quantity) || 0),
    0
  );
  const averagePrice = totalShares > 0 ? totalInvestment / totalShares : 0;

  const handleCopy = async () => {
    const text =
      `Stock Average Summary\n` +
      `Total Shares: ${totalShares.toLocaleString()}\n` +
      `Total Investment: ${currency}${totalInvestment.toFixed(2)}\n` +
      `Average Price: ${currency}${averagePrice.toFixed(decimals)}`;
    await Clipboard.setStringAsync(text);
    setCopied(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Render tranche row ────────────────────────────────────
  const renderItem = ({ item }: { item: Tranche }) => {
    const rowTotal = (item.buyPrice || 0) * (item.quantity || 0);
    return (
      <View
        style={[
          styles.trancheRow,
          { borderBottomColor: palette.divider },
        ]}
      >
        <View style={styles.trancheInputs}>
          <NumericInput
            label={`Buy Price (${currency})`}
            value={item.buyPrice}
            onChangeValue={(v) => updateTranche(item.id, 'buyPrice', v)}
            style={{ flex: 1, marginRight: SPACING.sm, marginBottom: 0 }}
          />
          <NumericInput
            label="Quantity"
            value={item.quantity}
            onChangeValue={(v) => updateTranche(item.id, 'quantity', v)}
            style={{ flex: 1, marginBottom: 0 }}
          />
        </View>
        <View style={styles.trancheBottom}>
          <Text style={[styles.trancheTotal, { color: palette.textMuted }]}>
            Total: {currency}
            {rowTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <TouchableOpacity
            onPress={() => removeRow(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={20} color={palette.statusLoss} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: palette.appBg }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: palette.textPrimary }]}>
          Stock Average
        </Text>
        <TouchableOpacity
          onPress={resetAll}
          style={[styles.resetBtn, { borderColor: palette.statusLoss + '60' }]}
        >
          <Ionicons name="refresh-outline" size={15} color={palette.statusLoss} />
          <Text style={[styles.resetTxt, { color: palette.statusLoss }]}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tranche list */}
      <SectionCard padding={0}>
        <FlatList
          data={tranches}
          keyExtractor={(t) => t.id}
          renderItem={renderItem}
          scrollEnabled={false}
          ItemSeparatorComponent={() => (
            <View style={{ height: 1, backgroundColor: palette.divider }} />
          )}
        />
        <TouchableOpacity
          onPress={addRow}
          style={[styles.addBtn, { borderTopColor: palette.divider }]}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={palette.accentPrimary}
          />
          <Text style={[styles.addTxt, { color: palette.accentPrimary }]}>
            Add Row
          </Text>
        </TouchableOpacity>
      </SectionCard>

      {/* Summary */}
      <View style={styles.summaryHeader}>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Summary
        </Text>
        <TouchableOpacity onPress={handleCopy} style={styles.copyBtn}>
          <Ionicons
            name={copied ? 'checkmark-done-outline' : 'copy-outline'}
            size={16}
            color={copied ? palette.statusProfit : palette.textMuted}
          />
          <Text
            style={[
              styles.copyTxt,
              { color: copied ? palette.statusProfit : palette.textMuted },
            ]}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          label="Total Shares"
          value={totalShares.toLocaleString(undefined, {
            maximumFractionDigits: decimals,
          })}
          style={styles.statHalf}
        />
        <StatCard
          label="Total Investment"
          value={`${currency}${totalInvestment.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          style={styles.statHalf}
        />
      </View>
      <StatCard
        label="Average Price"
        value={`${currency}${averagePrice.toFixed(decimals)}`}
        valueColor={palette.accentPrimary}
        large
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: SPACING.base, paddingBottom: SPACING.xxxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  resetTxt: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.medium },
  trancheRow: { padding: SPACING.base, borderBottomWidth: 1 },
  trancheInputs: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  trancheBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trancheTotal: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.medium },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
    borderTopWidth: 1,
  },
  addTxt: { fontSize: FONT_SIZES.base, fontWeight: FONT_WEIGHTS.semibold },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
  },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  copyTxt: { fontSize: FONT_SIZES.sm },
  statsGrid: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  statHalf: { flex: 1 },
});

export default StockAverageScreen;
