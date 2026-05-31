import React, { useEffect, useMemo } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MOCK_EVENT } from '../mockData';
import { colors, spacing, typography } from '../theme';
import type { AnalyzingScreenProps } from '../types';

export default function AnalyzingScreen({ navigation, route }: AnalyzingScreenProps) {
  const insets = useSafeAreaInsets();
  const { imageUri } = route.params;

  const rotation = useMemo(() => new Animated.Value(0), []);
  const progress = useMemo(() => new Animated.Value(0), []);
  const dotOpacity1 = useMemo(() => new Animated.Value(0.3), []);
  const dotOpacity2 = useMemo(() => new Animated.Value(0.3), []);
  const dotOpacity3 = useMemo(() => new Animated.Value(0.3), []);

  const spin = useMemo(
    () =>
      rotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      }),
    [rotation],
  );

  const progressWidth = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
      }),
    [progress],
  );

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dotOpacity1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotOpacity2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotOpacity3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotOpacity1, { toValue: 0.3, duration: 200, useNativeDriver: true }),
        Animated.timing(dotOpacity2, { toValue: 0.3, duration: 200, useNativeDriver: true }),
        Animated.timing(dotOpacity3, { toValue: 0.3, duration: 200, useNativeDriver: true }),
      ]),
    ).start();

    Animated.timing(progress, {
      toValue: 1,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      navigation.replace('Result', {
        imageUri,
        event: MOCK_EVENT,
      });
    }, 3200);

    return () => clearTimeout(timer);
  }, [rotation, progress, dotOpacity1, dotOpacity2, dotOpacity3, navigation, imageUri]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Image preview */}
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Preview</Text>
          </View>
        )}
        <View style={styles.imageOverlay} />
      </View>

      {/* Analysis UI */}
      <View style={styles.analysisArea}>
        <View style={styles.spinnerContainer}>
          <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
            <View style={styles.spinnerArc} />
          </Animated.View>
        </View>

        <View style={styles.dotsRow}>
          <Animated.Text style={[styles.dot, { opacity: dotOpacity1 }]}>.</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dotOpacity2 }]}>.</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dotOpacity3 }]}>.</Animated.Text>
        </View>

        <Text style={styles.analysisTitle}>解析中</Text>
        <Text style={styles.analysisBody}>
          AIがフライヤーからイベント情報を読み取っています
        </Text>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>

        <Text style={styles.analysisCaption}>
          イベント名、日時、会場などを抽出しています
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  imageContainer: {
    height: '40%',
    backgroundColor: colors.surfaceSoft,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
  },
  imagePlaceholderText: {
    ...typography.bodySm,
    color: colors.hairline,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },

  analysisArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  spinnerContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  spinner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.hairlineSoft,
  },
  spinnerArc: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: colors.primary,
  },
  dotsRow: {
    flexDirection: 'row',
    position: 'absolute',
    top: '50%',
    marginTop: -80,
  },
  dot: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginHorizontal: 2,
  },
  analysisTitle: {
    ...typography.headline,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  analysisBody: {
    ...typography.body,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: colors.hairlineSoft,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  analysisCaption: {
    ...typography.caption,
    color: colors.ink,
  },
});
