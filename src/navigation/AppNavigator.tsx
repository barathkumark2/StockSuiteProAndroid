// ─────────────────────────────────────────────────────────────
// AppNavigator.tsx  –  Full Overlay Drawer Navigation
// ─────────────────────────────────────────────────────────────
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import React, { useRef, useState, useEffect } from 'react';
import { 
  Animated, 
  Platform, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';

// Screens
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

// ─── Constants ────────────────────────────────────────────────
const SIDEBAR_EXPANDED = 280;
const SIDEBAR_COLLAPSED = 0;
const ANIMATION_DURATION = 300;

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

const AppNavigator: React.FC = () => {
  const { palette } = useSettings();
  const [activeScreen, setActiveScreen] = useState<ScreenId>('portfolio');
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Animation refs
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
        duration: isExpanded ? 150 : ANIMATION_DURATION,
        useNativeDriver: false,
      }),
    ]).start();

    setIsExpanded(!isExpanded);
  };

  // Sync browser title on Web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const activeLabel = navItems.find((n) => n.id === activeScreen)?.label;
      document.title = activeLabel ? `${activeLabel} | StockSuite Pro` : 'StockSuite Pro';
    }
  }, [activeScreen]);

  const ActiveComponent = 
    navItems.find((n) => n.id === activeScreen)?.component ?? PortfolioScreen;

  return (
    <NavigationContainer>
      <SafeAreaView
        style={[styles.root, { backgroundColor: palette.appBg }]}
        edges={['top', 'bottom']}
      >
        <View style={styles.row}>
          
          {/* ── Backdrop Overlay ─────────────────────────── */}
          {isExpanded && (
            <Pressable 
              style={styles.backdrop} 
              onPress={toggle}
              pointerEvents="auto"
            >
              <Animated.View 
                style={[
                  styles.backdropInner, 
                  { 
                    backgroundColor: '#000',
                    opacity: labelOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.6]
                    })
                  }
                ]} 
              />
            </Pressable>
          )}

          {/* ── Sidebar (Overlay Drawer) ─────────────────── */}
          <Animated.View
            style={[
              styles.sidebar,
              {
                width: sidebarWidth,
                backgroundColor: palette.cardBg,
                borderRightColor: palette.cardBorder,
                zIndex: 1000,
              },
            ]}
          >
            {/* Brand section */}
            <View style={[styles.brandRow, { borderBottomColor: palette.divider }]}>
              <Animated.View style={{ opacity: labelOpacity, flex: 1 }}>
                <View style={styles.brandTextRow}>
                  <Text style={[styles.brandStock, { color: palette.accentPrimary }]}>Stock</Text>
                  <Text style={[styles.brandSuite, { color: palette.accentSecondary }]}>Suite</Text>
                  <Text style={[styles.brandPro, { color: palette.textMuted }]}> Pro</Text>
                </View>
              </Animated.View>

              <TouchableOpacity onPress={toggle} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Nav items */}
            <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
              {navItems.map((item) => {
                const isActive = activeScreen === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      setActiveScreen(item.id);
                      toggle();
                    }}
                    style={({ pressed }) => [
                      styles.navItem,
                      isActive && { backgroundColor: palette.accentPrimary + '15' },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View style={[styles.activeIndicator, { backgroundColor: isActive ? palette.accentPrimary : 'transparent' }]} />
                    <View style={styles.navIcon}>
                      {isActive ? item.activeIcon : item.icon}
                    </View>
                    <Animated.Text
                      style={[
                        styles.navLabel,
                        {
                          opacity: labelOpacity,
                          color: isActive ? palette.accentPrimary : palette.textSecondary,
                          fontWeight: isActive ? FONT_WEIGHTS.semibold : FONT_WEIGHTS.regular,
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

            <Animated.View style={[styles.footer, { opacity: labelOpacity, borderTopColor: palette.divider }]}>
              <Text style={[styles.footerTxt, { color: palette.textMuted }]}>v1.1.0 · Pro Edition</Text>
            </Animated.View>
          </Animated.View>

          {/* ── Main content ──────────────────────────────── */}
          <View style={styles.content}>
            <View style={[styles.header, { backgroundColor: palette.cardBg, borderBottomColor: palette.cardBorder }]}>
              <TouchableOpacity onPress={toggle} style={styles.menuBtn}>
                <Ionicons name="menu" size={26} color={palette.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>
                {navItems.find(n => n.id === activeScreen)?.label}
              </Text>
            </View>

            <View style={styles.screenContainer}>
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
  
  // Sidebar styles
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRightWidth: 1,
    overflow: 'hidden',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  backdropInner: {
    ...StyleSheet.absoluteFillObject,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    height: 64,
  },
  brandTextRow: { flexDirection: 'row', alignItems: 'baseline' },
  brandStock: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.extrabold },
  brandSuite: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.extrabold },
  brandPro: { fontSize: FONT_SIZES.sm, fontWeight: FONT_WEIGHTS.medium },
  closeBtn: { padding: 4 },

  navList: { flex: 1, paddingTop: SPACING.sm },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.sm,
    marginVertical: 2,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    height: 48,
  },
  activeIndicator: { width: 4, height: '60%', borderRadius: 2, marginRight: 8 },
  navIcon: { width: 32, alignItems: 'center' },
  navLabel: { flex: 1, fontSize: FONT_SIZES.md, marginLeft: SPACING.xs },

  footer: { padding: SPACING.md, borderTopWidth: 1, alignItems: 'center' },
  footerTxt: { fontSize: FONT_SIZES.xs },

  // Content styles
  content: { flex: 1 },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    gap: SPACING.md,
  },
  menuBtn: { padding: 4 },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: FONT_WEIGHTS.bold },
  screenContainer: { flex: 1 },
});

export default AppNavigator;
