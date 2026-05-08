// ─────────────────────────────────────────────────────────────
// ThemedProgressBar.tsx  –  Animated progress bar
// ─────────────────────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { RADIUS } from '../theme/theme';

interface Props {
  progress: number;   // 0–100
  color?: string;
  height?: number;
  trackColor?: string;
}

const ThemedProgressBar: React.FC<Props> = ({
  progress,
  color,
  height = 8,
  trackColor,
}) => {
  const { palette } = useSettings();
  const anim = useRef(new Animated.Value(0)).current;

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: clampedProgress,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [clampedProgress]);

  const widthInterpolated = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: trackColor ?? palette.cardBorder,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.bar,
          {
            width: widthInterpolated,
            height,
            borderRadius: height / 2,
            backgroundColor: color ?? palette.accentPrimary,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  bar: {},
});

export default ThemedProgressBar;
