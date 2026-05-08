// PortfolioScreen.tsx – Live portfolio tracker with analytics
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import PnLBadge from '../components/PnLBadge';
import SectionCard from '../components/SectionCard';
import StatCard from '../components/StatCard';
import ThemedProgressBar from '../components/ThemedProgressBar';
import { useSettings } from '../context/SettingsContext';
import {
  getItem,
  PortfolioPosition,
  setItem,
  STORAGE_KEYS,
} from '../db/storage';
import { CHART_COLORS, FONT_SIZES, FONT_WEIGHTS, RADIUS, SPACING } from '../theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - SPACING.base * 2 - 2;

type AnalyticsTab = 'allocation' | 'performance' | 'heatmap';

const makePosition = (symbol: string): PortfolioPosition => ({
  id: Crypto.randomUUID(),
  symbol: symbol.toUpperCase().trim(),
  qty: 0,
  avgPrice: 0,
  cmp: 0,
});

const PortfolioScreen: React.FC = () => {
  const { palette, currency, decimals } = useSettings();
  const [positions, setPositions] = useState<PortfolioPosition[]>([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [analyticsTab, setAnalyticsTab] = useState<AnalyticsTab>('allocation');

  useEffect(() => {
    (async () => {
      const saved = await getItem<PortfolioPosition[]>(STORAGE_KEYS.PORTFOLIO, []);
      setPositions(saved);
    })();
  }, []);

  const persist = useCallback(async (data: PortfolioPosition[]) => {
    await setItem(STORAGE_KEYS.PORTFOLIO, data);
  }, []);

  const addPosition = useCallback(async () => {
    if (!newSymbol.trim()) return;
    const pos = makePosition(newSymbol);
    const next = [...positions, pos];
    setPositions(next);
    setNewSymbol('');
    await persist(next);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [newSymbol, positions, persist]);

  const removePosition = useCallback(async (id: string) => {
    Alert.alert('Remove Position', 'Delete this position?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          const next = positions.filter(p => p.id !== id);
          setPositions(next);
          await persist(next);
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  }, [positions, persist]);

  const updatePosition = useCallback(async (id: string, field: keyof PortfolioPosition, val: number) => {
    setPositions(prev => {
      const next = prev.map(p => p.id === id ? { ...p, [field]: val } : p);
      persist(next);
      return next;
    });
  }, [persist]);

  // ── Totals ──────────────────────────────────────────────────
  const totalInvestment = positions.reduce((s, p) => s + p.qty * p.avgPrice, 0);
  const totalCurrent = positions.reduce((s, p) => s + p.qty * p.cmp, 0);
  const totalPnL = totalCurrent - totalInvestment;
  const totalPnLPct = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;
  const isTotalProfit = totalPnL >= 0;

  // ── Chart data ───────────────────────────────────────────────
  const pieDataCurrent = positions
    .filter(p => p.qty * p.cmp > 0)
    .map((p, i) => ({
      value: parseFloat((p.qty * p.cmp).toFixed(2)),
      label: p.symbol,
      color: CHART_COLORS[i % CHART_COLORS.length],
      text: p.symbol,
    }))
    .sort((a, b) => b.value - a.value);

  const pieDataInvested = positions
    .filter(p => p.qty * p.avgPrice > 0)
    .map((p, i) => ({
      value: parseFloat((p.qty * p.avgPrice).toFixed(2)),
      label: p.symbol,
      color: CHART_COLORS[i % CHART_COLORS.length],
      text: p.symbol,
    }))
    .sort((a, b) => b.value - a.value);

  const barData = positions
    .filter(p => p.qty * p.avgPrice > 0)
    .map((p, i) => {
      const invested = p.qty * p.avgPrice;
      const current = p.qty * p.cmp;
      const pnlPct = invested > 0 ? ((current - invested) / invested) * 100 : 0;
      return {
        label: p.symbol,
        value: parseFloat(Math.abs(pnlPct).toFixed(2)),
        frontColor: pnlPct >= 0 ? palette.statusProfit : palette.statusLoss,
        pnlPct,
        color: CHART_COLORS[i % CHART_COLORS.length],
      };
    });

  const groupedBarData: any[] = [];
  positions
    .filter(p => p.qty * p.avgPrice > 0)
    .forEach((p, i) => {
      const invested = p.qty * p.avgPrice;
      const current = p.qty * p.cmp;
      groupedBarData.push({
        value: invested,
        label: p.symbol,
        spacing: 2,
        frontColor: '#8b949e',
      });
      groupedBarData.push({
        value: current,
        frontColor: '#58a6ff',
      });
    });

  // Waterfall simulation with stacked bars
  let cumulativePnl = 0;
  const waterfallData: any[] = [];
  positions
    .filter(p => p.qty * p.avgPrice > 0)
    .forEach((p, i) => {
      const invested = p.qty * p.avgPrice;
      const current = p.qty * p.cmp;
      const pnl = current - invested;
      const start = cumulativePnl;
      cumulativePnl += pnl;

      const isPositive = pnl >= 0;
      const base = Math.min(start, cumulativePnl);
      const delta = Math.abs(pnl);

      waterfallData.push({
        stacks: [
          { value: Math.max(0, base), color: 'transparent' },
          { value: delta, color: isPositive ? palette.statusProfit : palette.statusLoss },
        ],
        label: p.symbol,
      });
    });

  // ── Render position card ─────────────────────────────────────
  const renderPosition = ({ item: pos }: { item: PortfolioPosition }) => {
    const investment = pos.qty * pos.avgPrice;
    const currentVal = pos.qty * pos.cmp;
    const pnl = currentVal - investment;
    const pnlPct = investment > 0 ? (pnl / investment) * 100 : 0;
    const isProfit = pnl >= 0;
    const isExpanded = expandedId === pos.id;

    const needsRecovery = !isProfit && pos.cmp > 0 && pos.avgPrice > pos.cmp;
    const percentRise = needsRecovery ? ((pos.avgPrice / pos.cmp) - 1) * 100 : 0;
    const isStrictProfit = pnl > 0 && pos.cmp > 0;
    const sharesToSell = isStrictProfit ? investment / pos.cmp : 0;
    const freeShares = isStrictProfit ? pos.qty - sharesToSell : 0;

    const milestones = [10, 20, 50, 100, 200, 500, 1000];
    const nextMilestone = milestones.find(m => m > pnlPct) ?? 10;
    const targetPrice = pos.avgPrice * (1 + nextMilestone / 100);
    const progressToMilestone = Math.min((pnlPct / nextMilestone) * 100, 100);

    return (
      <SectionCard style={{ marginBottom: SPACING.sm }}>
        {/* Symbol + badge row */}
        <TouchableOpacity
          style={styles.posHeader}
          onPress={() => setExpandedId(isExpanded ? null : pos.id)}
          activeOpacity={0.7}
        >
          <View style={styles.posHeaderLeft}>
            <Ionicons
              name={isExpanded ? 'chevron-down' : 'chevron-forward'}
              size={16} color={palette.textMuted}
            />
            <Text style={[styles.symbol, { color: palette.textPrimary }]}>
              {pos.symbol}
            </Text>
          </View>
          <PnLBadge isProfit={isProfit} />
        </TouchableOpacity>

        {/* Input row */}
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: palette.textMuted }]}>QTY</Text>
            <TextInput
              style={[styles.posInput, { color: palette.textPrimary, backgroundColor: palette.inputBg, borderColor: palette.inputBorder }]}
              value={pos.qty > 0 ? String(pos.qty) : ''}
              onChangeText={t => updatePosition(pos.id, 'qty', parseFloat(t) || 0)}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={palette.textMuted}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: palette.textMuted }]}>AVG ({currency})</Text>
            <TextInput
              style={[styles.posInput, { color: palette.textPrimary, backgroundColor: palette.inputBg, borderColor: palette.inputBorder }]}
              value={pos.avgPrice > 0 ? String(pos.avgPrice) : ''}
              onChangeText={t => updatePosition(pos.id, 'avgPrice', parseFloat(t) || 0)}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={palette.textMuted}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: palette.textMuted }]}>CMP ({currency})</Text>
            <TextInput
              style={[styles.posInput, {
                color: palette.textPrimary,
                backgroundColor: palette.inputBg,
                borderColor: isProfit ? palette.statusProfit + '60' : palette.statusLoss + '60',
              }]}
              value={pos.cmp > 0 ? String(pos.cmp) : ''}
              onChangeText={t => updatePosition(pos.id, 'cmp', parseFloat(t) || 0)}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={palette.textMuted}
            />
          </View>
        </View>

        {/* Values row */}
        <View style={styles.valuesRow}>
          <View>
            <Text style={[styles.valLabel, { color: palette.textMuted }]}>Invested</Text>
            <Text style={[styles.valTxt, { color: palette.textSecondary }]}>
              {currency}{investment.toFixed(2)}
            </Text>
          </View>
          <View>
            <Text style={[styles.valLabel, { color: palette.textMuted }]}>Current</Text>
            <Text style={[styles.valTxt, { color: palette.textSecondary }]}>
              {currency}{currentVal.toFixed(2)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.valLabel, { color: palette.textMuted }]}>P&L</Text>
            <Text style={[styles.valTxt, { color: isProfit ? palette.statusProfit : palette.statusLoss }]}>
              {isProfit ? '+' : ''}{currency}{pnl.toFixed(2)}
            </Text>
            <Text style={[styles.valSub, { color: isProfit ? palette.statusProfit : palette.statusLoss }]}>
              {isProfit ? '+' : ''}{pnlPct.toFixed(2)}%
            </Text>
          </View>
          <TouchableOpacity onPress={() => removePosition(pos.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={18} color={palette.statusLoss} />
          </TouchableOpacity>
        </View>

        {/* Expanded Strategist */}
        {isExpanded && (needsRecovery || isStrictProfit) && (
          <View style={styles.strategistWrap}>
            {needsRecovery && (
              <View style={[styles.strategistBox, { backgroundColor: palette.lossBg, borderColor: palette.statusLoss + '40' }]}>
                <View style={styles.strategistHeader}>
                  <Ionicons name="alert-circle-outline" size={18} color={palette.statusLoss} />
                  <Text style={[styles.strategistTitle, { color: palette.textPrimary }]}>Break-even Strategist</Text>
                </View>
                <Text style={[styles.strategistSub, { color: palette.textMuted }]}>
                  {pos.symbol} must rise by{' '}
                  <Text style={{ color: palette.statusLoss, fontWeight: FONT_WEIGHTS.bold }}>
                    {percentRise.toFixed(2)}%
                  </Text>{' '}
                  to break even
                </Text>
                <View style={{ marginTop: SPACING.sm }}>
                  <ThemedProgressBar
                    progress={Math.min((pos.cmp / pos.avgPrice) * 100, 100)}
                    color={palette.statusLoss}
                    height={6}
                  />
                  <View style={styles.progressLabels}>
                    <Text style={[styles.progressLbl, { color: palette.textMuted }]}>
                      CMP: {currency}{pos.cmp.toFixed(decimals)}
                    </Text>
                    <Text style={[styles.progressLbl, { color: palette.textMuted }]}>
                      Target: {currency}{pos.avgPrice.toFixed(decimals)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            {isStrictProfit && (
              <View style={[styles.strategistBox, { backgroundColor: palette.profitBg, borderColor: palette.statusProfit + '40', marginTop: needsRecovery ? SPACING.sm : 0 }]}>
                <View style={styles.strategistHeader}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={palette.statusProfit} />
                  <Text style={[styles.strategistTitle, { color: palette.textPrimary }]}>Profit Strategist: Free Ride</Text>
                </View>
                <Text style={[styles.strategistSub, { color: palette.textMuted }]}>
                  Sell{' '}
                  <Text style={{ color: palette.statusProfit, fontWeight: FONT_WEIGHTS.bold }}>
                    {Math.ceil(sharesToSell)}
                  </Text>{' '}
                  shares to recover {currency}{investment.toFixed(2)} — retain{' '}
                  <Text style={{ color: palette.statusProfit, fontWeight: FONT_WEIGHTS.bold }}>
                    {Math.floor(freeShares)}
                  </Text>{' '}
                  risk-free shares
                </Text>
                <View style={{ marginTop: SPACING.sm }}>
                  <ThemedProgressBar
                    progress={progressToMilestone}
                    color={palette.statusProfit}
                    height={6}
                  />
                  <View style={styles.progressLabels}>
                    <Text style={[styles.progressLbl, { color: palette.textMuted }]}>
                      {pnlPct.toFixed(2)}% gain
                    </Text>
                    <Text style={[styles.progressLbl, { color: palette.textMuted }]}>
                      Next +{nextMilestone}%: {currency}{targetPrice.toFixed(decimals)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </SectionCard>
    );
  };

  // ── Analytics tab content ────────────────────────────────────
  const renderAnalytics = () => {
    if (positions.length === 0) return null;
    return (
      <View style={{ marginBottom: SPACING.base }}>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Portfolio Analytics</Text>

        {/* Tab selector */}
        <View style={[styles.tabBar, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
          {([['allocation', 'Allocation'], ['performance', 'Performance'], ['heatmap', 'Advanced']] as [AnalyticsTab, string][]).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setAnalyticsTab(key)}
              style={[
                styles.tab,
                analyticsTab === key && {
                  backgroundColor: palette.accentPrimary + '15',
                  borderBottomColor: palette.accentPrimary,
                  borderBottomWidth: 2
                }
              ]}
            >
              <Text style={[
                styles.tabTxt,
                { color: analyticsTab === key ? palette.accentPrimary : palette.textMuted }
              ]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <SectionCard>
          {analyticsTab === 'allocation' && pieDataCurrent.length > 0 && (
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              <View style={{ alignItems: 'center', marginBottom: SPACING.xl }}>
                <Text style={[styles.chartTitle, { color: palette.textMuted }]}>By Current Value</Text>
                <PieChart
                  data={pieDataCurrent}
                  donut
                  radius={80}
                  innerRadius={45}
                  innerCircleColor={palette.cardBg}
                  centerLabelComponent={() => (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[styles.pieCenter, { color: palette.textPrimary, fontSize: 12 }]}>
                        {currency}{totalCurrent.toFixed(0)}
                      </Text>
                      <Text style={[styles.pieCenterSub, { color: palette.textMuted, fontSize: 10 }]}>Total</Text>
                    </View>
                  )}
                />
                <View style={styles.legend}>
                  {pieDataCurrent.map((d, i) => (
                    <View key={i} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                      <Text style={[styles.legendTxt, { color: palette.textSecondary }]}>{d.label}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: palette.divider, marginVertical: SPACING.lg, opacity: 0.3 }} />

              <View style={{ alignItems: 'center' }}>
                <Text style={[styles.chartTitle, { color: palette.textMuted }]}>By Invested Value</Text>
                <PieChart
                  data={pieDataInvested}
                  donut
                  radius={80}
                  innerRadius={45}
                  innerCircleColor={palette.cardBg}
                  centerLabelComponent={() => (
                    <View style={{ alignItems: 'center' }}>
                      <Text style={[styles.pieCenter, { color: palette.textPrimary, fontSize: 12 }]}>
                        {currency}{totalInvestment.toFixed(0)}
                      </Text>
                      <Text style={[styles.pieCenterSub, { color: palette.textMuted, fontSize: 10 }]}>Invested</Text>
                    </View>
                  )}
                />
                <View style={styles.legend}>
                  {pieDataInvested.map((d, i) => (
                    <View key={i} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                      <Text style={[styles.legendTxt, { color: palette.textSecondary }]}>{d.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          )}

          {analyticsTab === 'performance' && (
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {/* P&L % Chart */}
              <View style={{ marginBottom: SPACING.xl }}>
                <Text style={[styles.chartTitle, { color: palette.textMuted }]}>P&L % by Stock</Text>
                <BarChart
                  data={barData}
                  width={CHART_WIDTH - SPACING.base * 4}
                  height={150}
                  barWidth={20}
                  noOfSections={3}
                  yAxisTextStyle={{ color: palette.textMuted, fontSize: 9 }}
                  xAxisLabelTextStyle={{ color: palette.textMuted, fontSize: 9 }}
                  xAxisColor={palette.divider}
                  yAxisColor={palette.divider}
                  rulesColor={palette.divider}
                  barBorderTopLeftRadius={4}
                  barBorderTopRightRadius={4}
                  isAnimated
                />
              </View>

              <View style={{ height: 1, backgroundColor: palette.divider, marginVertical: SPACING.lg, opacity: 0.3 }} />

              {/* Invested vs Current Chart */}
              <View style={{ marginBottom: SPACING.xl }}>
                <Text style={[styles.chartTitle, { color: palette.textMuted }]}>Invested vs. Current Value</Text>
                <BarChart
                  data={groupedBarData}
                  width={CHART_WIDTH - SPACING.base * 4}
                  height={150}
                  barWidth={12}
                  spacing={10}
                  noOfSections={3}
                  yAxisTextStyle={{ color: palette.textMuted, fontSize: 9 }}
                  xAxisLabelTextStyle={{ color: palette.textMuted, fontSize: 9 }}
                  xAxisColor={palette.divider}
                  yAxisColor={palette.divider}
                  rulesColor={palette.divider}
                  isAnimated
                />
                <View style={[styles.legend, { marginTop: SPACING.sm }]}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#8b949e' }]} />
                    <Text style={[styles.legendTxt, { color: palette.textSecondary }]}>Inv</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#58a6ff' }]} />
                    <Text style={[styles.legendTxt, { color: palette.textSecondary }]}>Cur</Text>
                  </View>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: palette.divider, marginVertical: SPACING.lg, opacity: 0.3 }} />

              {/* Waterfall Chart */}
              <View>
                <Text style={[styles.chartTitle, { color: palette.textMuted }]}>Cumulative P&L (Waterfall)</Text>
                <BarChart
                  stackData={waterfallData}
                  width={CHART_WIDTH - SPACING.base * 4}
                  height={150}
                  barWidth={16}
                  noOfSections={3}
                  yAxisTextStyle={{ color: palette.textMuted, fontSize: 9 }}
                  xAxisLabelTextStyle={{ color: palette.textMuted, fontSize: 9 }}
                  xAxisColor={palette.divider}
                  yAxisColor={palette.divider}
                  rulesColor={palette.divider}
                  isAnimated
                />
              </View>
            </ScrollView>
          )}

          {analyticsTab === 'heatmap' && (
            <View>
              <Text style={[styles.chartTitle, { color: palette.textMuted }]}>P&L Heat Map (Size: Index, Color: P&L %)</Text>
              <View style={styles.heatmapGrid}>
                {positions.filter(p => p.qty > 0).map((p, i) => {
                  const inv = p.qty * p.avgPrice;
                  const cur = p.qty * p.cmp;
                  const pct = inv > 0 ? ((cur - inv) / inv) * 100 : 0;
                  const isPos = pct >= 0;
                  const intensity = Math.min(Math.abs(pct) / 30, 1);
                  const baseColor = isPos ? palette.statusProfit : palette.statusLoss;
                  return (
                    <View key={p.id} style={[styles.heatCell, { backgroundColor: baseColor + Math.round(intensity * 80 + 30).toString(16).padStart(2, '0'), borderColor: baseColor + '40' }]}>
                      <Text style={[styles.heatSymbol, { color: '#ffffff' }]}>{p.symbol}</Text>
                      <Text style={[styles.heatValue, { color: '#ffffff', opacity: 0.8, fontSize: 10 }]}>
                        {currency}{cur.toFixed(0)}
                      </Text>
                      <Text style={[styles.heatPct, { color: '#ffffff', fontWeight: 'bold' }]}>
                        {isPos ? '+' : ''}{pct.toFixed(1)}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </SectionCard>
      </View>
    );
  };

  return (
    <FlatList
      style={[styles.root, { backgroundColor: palette.appBg }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      data={positions}
      keyExtractor={p => p.id}
      renderItem={renderPosition}
      ListHeaderComponent={() => (
        <>
          {/* Title */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="briefcase-outline" size={22} color={palette.accentPrimary} />
              <Text style={[styles.title, { color: palette.textPrimary }]}>Live Portfolio</Text>
            </View>
          </View>

          {/* Summary cards */}
          <View style={styles.summaryGrid}>
            <StatCard label="Portfolio Value" value={`${currency}${totalCurrent.toFixed(2)}`} style={styles.fullCard} />
          </View>
          <View style={styles.summaryGrid}>
            <StatCard
              label="Total P&L"
              value={`${isTotalProfit ? '+' : ''}${currency}${totalPnL.toFixed(2)}`}
              valueColor={isTotalProfit ? palette.statusProfit : palette.statusLoss}
              style={styles.halfCard}
            />
            <StatCard
              label="Overall Return"
              value={`${isTotalProfit ? '+' : ''}${totalPnLPct.toFixed(2)}%`}
              valueColor={isTotalProfit ? palette.statusProfit : palette.statusLoss}
              style={styles.halfCard}
            />
          </View>

          {/* Analytics */}
          {renderAnalytics()}

          {/* Add position */}
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Positions</Text>
          <View style={[styles.addRow, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
            <TextInput
              style={[styles.symbolInput, { color: palette.textPrimary }]}
              value={newSymbol}
              onChangeText={setNewSymbol}
              placeholder="Stock Symbol (e.g. AAPL)"
              placeholderTextColor={palette.textMuted}
              autoCapitalize="characters"
              onSubmitEditing={addPosition}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={addPosition}
              style={[styles.addBtn, { backgroundColor: palette.accentPrimary }]}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.addBtnTxt}>Add</Text>
            </TouchableOpacity>
          </View>

          {positions.length === 0 && (
            <View style={[styles.emptyBox, { borderColor: palette.cardBorder }]}>
              <MaterialCommunityIcons name="briefcase-outline" size={48} color={palette.textMuted} style={{ opacity: 0.4 }} />
              <Text style={[styles.emptyTitle, { color: palette.textMuted }]}>No active positions</Text>
              <Text style={[styles.emptyHint, { color: palette.textMuted }]}>Add a stock symbol above to start tracking.</Text>
            </View>
          )}
        </>
      )}
    />
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: SPACING.base, paddingBottom: SPACING.xxxl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.base },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  title: { fontSize: FONT_SIZES.xl, fontWeight: FONT_WEIGHTS.bold },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold, marginBottom: SPACING.sm },
  summaryGrid: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  fullCard: { flex: 1 },
  halfCard: { flex: 1 },
  tabBar: { flexDirection: 'row', borderRadius: RADIUS.md, borderWidth: 1, overflow: 'hidden', marginBottom: SPACING.sm },
  tab: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm },
  tabTxt: { fontSize: 11, fontWeight: FONT_WEIGHTS.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  chartTitle: { fontSize: FONT_SIZES.xs, textAlign: 'center', marginBottom: SPACING.md, fontWeight: FONT_WEIGHTS.medium, color: '#8b949e' },
  pieCenter: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },
  pieCenterSub: { fontSize: 9 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: SPACING.sm, marginTop: SPACING.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTxt: { fontSize: FONT_SIZES.xs },
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  heatCell: { borderRadius: RADIUS.md, borderWidth: 1, padding: SPACING.sm, minWidth: 70, alignItems: 'center' },
  heatSymbol: { fontSize: FONT_SIZES.xs, fontWeight: FONT_WEIGHTS.bold },
  heatValue: { fontSize: 10, marginTop: 1 },
  heatPct: { fontSize: FONT_SIZES.xs, marginTop: 2 },
  addRow: { flexDirection: 'row', alignItems: 'center', borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden', marginBottom: SPACING.base },
  symbolInput: { flex: 1, fontSize: FONT_SIZES.base, padding: SPACING.md },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.base, paddingVertical: SPACING.md },
  addBtnTxt: { color: '#ffffff', fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.base },
  emptyBox: { borderRadius: RADIUS.lg, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', padding: SPACING.xxxl, gap: SPACING.sm },
  emptyTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.semibold },
  emptyHint: { fontSize: FONT_SIZES.sm, textAlign: 'center' },
  posHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  posHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  symbol: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold },
  inputRow: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.sm },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: 9, fontWeight: FONT_WEIGHTS.medium, marginBottom: 3, letterSpacing: 0.4, textTransform: 'uppercase' },
  posInput: { borderRadius: RADIUS.sm, borderWidth: 1, paddingHorizontal: SPACING.sm, paddingVertical: 4, fontSize: 12, height: 36 },
  valuesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  valLabel: { fontSize: 9, fontWeight: FONT_WEIGHTS.medium, marginBottom: 1, textTransform: 'uppercase' },
  valTxt: { fontSize: 13, fontWeight: FONT_WEIGHTS.semibold },
  valSub: { fontSize: 10, marginTop: 1 },
  strategistWrap: { marginTop: SPACING.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: SPACING.md },
  strategistBox: { borderRadius: RADIUS.md, borderWidth: 1, padding: SPACING.md },
  strategistHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.xs },
  strategistTitle: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.bold },
  strategistSub: { fontSize: FONT_SIZES.xs, lineHeight: 18, marginBottom: SPACING.xs },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.xs },
  progressLbl: { fontSize: FONT_SIZES.xs },
});

export default PortfolioScreen;
