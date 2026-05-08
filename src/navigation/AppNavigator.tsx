// ─────────────────────────────────────────────────────────────
// AppNavigator.tsx  –  Collapsible side navigation layout
// ─────────────────────────────────────────────────────────────
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import LossRecoveryScreen from '../screens/LossRecoveryScreen';
import PortfolioScreen from '../screens/PortfolioScreen';
import ProfitLossScreen from '../screens/ProfitLossScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StockAverageScreen from '../screens/StockAverageScreen';
import TargetAverageScreen from '../screens/TargetAverageScreen';
import {
  FONT_SIZES,
  FONT_WEIGHTS,
  RADIUS,
  SPACING,
} from '../theme/theme';

// ─── Nav items ────────────────────────────────────────────────
type ScreenId =
  | 'portfolio'
  | 'stockavg'
  | 'targetavg'
  | 'profitloss'
  | 'lossrecovery'
  | 'settings';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  component: React.FC;
}

const SIDEBAR_EXPANDED = 220;
const SIDEBAR_COLLAPSED = 64;
const ANIMATION_DURATION = 300;

const AppNavigator: React.FC = () => {
  const { palette } = useSettings();
  const [activeScreen, setActiveScreen] = useState<ScreenId>('portfolio');
  const [isExpanded, setIsExpanded] = useState(false);
  const sidebarWidth = useRef(new Animated.Value(SIDEBAR_COLLAPSED)).current;
  const labelOpacity = useRef(new Animated.Value(0)).current;

  const navItems: NavItem[] = [
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: <MaterialCommunityIcons name="briefcase-outline" size={22} color={palette.tabBarInactive} />,
      activeIcon: <MaterialCommunityIcons name="briefcase" size={22} color={palette.accentPrimary} />,
      component: PortfolioScreen,
    },
    {
      id: 'stockavg',
      label: 'Stock Average',
      icon: <Ionicons name="calculator-outline" size={22} color={palette.tabBarInactive} />,
      activeIcon: <Ionicons name="calculator" size={22} color={palette.accentPrimary} />,
      component: StockAverageScreen,
    },
    {
      id: 'targetavg',
      label: 'Target Average',
      icon: <Ionicons name="trending-up-outline" size={22} color={palette.tabBarInactive} />,
      activeIcon: <Ionicons name="trending-up" size={22} color={palette.accentPrimary} />,
      component: TargetAverageScreen,
    },
    {
      id: 'profitloss',
      label: 'Profit / Loss',
      icon: <Ionicons name="stats-chart-outline" size={22} color={palette.tabBarInactive} />,
      activeIcon: <Ionicons name="stats-chart" size={22} color={palette.accentPrimary} />,
      component: ProfitLossScreen,
    },
    {
      id: 'lossrecovery',
      label: 'Loss Recovery',
      icon: <Ionicons name="refresh-circle-outline" size={22} color={palette.tabBarInactive} />,
      activeIcon: <Ionicons name="refresh-circle" size={22} color={palette.accentPrimary} />,
      component: LossRecoveryScreen,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Ionicons name="settings-outline" size={22} color={palette.tabBarInactive} />,
      activeIcon: <Ionicons name="settings" size={22} color={palette.accentPrimary} />,
      component: SettingsScreen,
    },
  ];

  const toggle = () => {
    const toWidth = isExpanded ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;
    const toOpacity = isExpanded ? 0 : 1;

    Animated.parallel([
      Animated.timing(sidebarWidth, {
        toValue: toWidth,
        duration: ANIMATION_DURATION,
        useNativeDriver: false,
      }),
      Animated.timing(labelOpacity, {
        toValue: toOpacity,
        duration: isExpanded ? 100 : ANIMATION_DURATION,
        useNativeDriver: false,
      }),
    ]).start();

    setIsExpanded(!isExpanded);
  };

  // ─── Sync browser title on Web ──────────────────────────────
  useEffect(() => {
    if (Platform.OS === 'web') {
      const activeLabel = navItems.find((n) => n.id === activeScreen)?.label;
      document.title = activeLabel ? `${activeLabel} | StockSuite Pro` : 'StockSuite Pro';
    }
  }, [activeScreen, palette]); // Re-run on screen change or palette change

  const ActiveComponent =
    navItems.find((n) => n.id === activeScreen)?.component ?? PortfolioScreen;

  return (
    <NavigationContainer>
      <SafeAreaView
        style={[styles.root, { backgroundColor: palette.appBg }]}
        edges={['top', 'bottom']}
      >
        {/* ── Layout row ────────────────────────────────────── */}
        <View style={styles.row}>

          {/* ── Sidebar ───────────────────────────────────── */}
          <Animated.View
            style={[
              styles.sidebar,
              {
                width: sidebarWidth,
                backgroundColor: palette.cardBg,
                borderRightColor: palette.cardBorder,
              },
            ]}
          >
          {/* Brand + toggle */}
          <View
            style={[
              styles.brandRow,
              !isExpanded && styles.brandRowCollapsed,
              { borderBottomColor: palette.divider },
            ]}
          >
            <Animated.View style={{ opacity: labelOpacity, flex: 1 }}>
              <View style={styles.brandTextRow}>
                <Text style={[styles.brandStock, { color: palette.accentPrimary }]}>
                  Stock
                </Text>
                <Text style={[styles.brandSuite, { color: palette.accentSecondary }]}>
                  Suite
                </Text>
                <Text style={[styles.brandPro, { color: palette.textMuted }]}>
                  {' '}Pro
                </Text>
              </View>
            </Animated.View>

            <TouchableOpacity
              onPress={toggle}
              style={[styles.toggleBtn, { backgroundColor: palette.appBg }]}
            >
              <Ionicons
                name={isExpanded ? 'chevron-back' : 'chevron-forward'}
                size={18}
                color={palette.accentPrimary}
              />
            </TouchableOpacity>
          </View>

          {/* Nav items */}
          <ScrollView
            style={styles.navList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.navListContent}
          >
            {navItems.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    setActiveScreen(item.id);
                    if (isExpanded) toggle();
                  }}
                  style={({ pressed }) => [
                    styles.navItem,
                    !isExpanded && styles.navItemCollapsed,
                    isActive && {
                      backgroundColor: palette.accentPrimary + '18',
                    },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  {/* Active indicator bar */}
                  <View
                    style={[
                      styles.activeBar,
                      { backgroundColor: isActive ? palette.accentPrimary : 'transparent' },
                    ]}
                  />

                  {/* Icon */}
                  <View style={styles.navIcon}>
                    {isActive ? item.activeIcon : item.icon}
                  </View>

                  {/* Label */}
                  <Animated.Text
                    style={[
                      styles.navLabel,
                      {
                        opacity: labelOpacity,
                        color: isActive
                          ? palette.accentPrimary
                          : palette.textSecondary,
                        fontWeight: isActive
                          ? FONT_WEIGHTS.semibold
                          : FONT_WEIGHTS.regular,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Animated.Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Version footer */}
          <Animated.View
            style={[
              styles.footer,
              { borderTopColor: palette.divider, opacity: labelOpacity },
            ]}
          >
            <Text style={[styles.footerTxt, { color: palette.textMuted }]}>
              v1.0.0 · Android & Web
            </Text>
          </Animated.View>
        </Animated.View>

        {/* ── Main content ──────────────────────────────── */}
        <View style={styles.content}>
          {/* Screen header bar */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: palette.cardBg,
                borderBottomColor: palette.cardBorder,
              },
            ]}
          >
            <View style={styles.headerLeft}>
              {!isExpanded && (
                <TouchableOpacity onPress={toggle} style={styles.headerMenuBtn}>
                  <Ionicons name="menu" size={24} color={palette.textPrimary} />
                </TouchableOpacity>
              )}
              <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>
                {navItems.find((n) => n.id === activeScreen)?.label}
              </Text>
            </View>
          </View>

          {/* Active screen */}
          <View style={styles.screenWrap}>
            <ActiveComponent />
          </View>
        </View>
      </View>
    </SafeAreaView>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },

  // ── Sidebar ────────────────────────────────────────────────
  sidebar: {
    width: SIDEBAR_COLLAPSED,
    borderRightWidth: 1,
    overflow: 'hidden',
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  brandRowCollapsed: {
    justifyContent: 'center',
  },
  brandTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandStock: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.extrabold,
  },
  brandSuite: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.extrabold,
  },
  brandPro: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
  },
  toggleBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  navList: { flex: 1 },
  navListContent: { paddingVertical: SPACING.sm },

  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
    marginVertical: 2,
    borderRadius: RADIUS.md,
    height: 44,
    overflow: 'hidden',
  },
  navItemCollapsed: {
    justifyContent: 'center',
    marginHorizontal: SPACING.xs,
  },
  activeBar: {
    width: 3,
    height: '60%',
    borderRadius: 2,
    marginRight: SPACING.xs,
  },
  navIcon: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLabel: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    marginLeft: SPACING.xs,
  },

  footer: {
    borderTopWidth: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  footerTxt: {
    fontSize: FONT_SIZES.xs,
  },

  // ── Content ───────────────────────────────────────────────
  content: { flex: 1 },
  header: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    ...Platform.select({
      android: { elevation: 2 },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
    }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerMenuBtn: {
    padding: 4,
    marginRight: 4,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.bold,
  },
  screenWrap: { flex: 1 },
});

export default AppNavigator;
