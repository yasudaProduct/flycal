import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, rounded, spacing, typography } from '../theme';
import type { SuccessScreenProps } from '../types';

export default function SuccessScreen({ navigation, route }: SuccessScreenProps) {
  const insets = useSafeAreaInsets();
  const { event } = route.params;

  const scale = useMemo(() => new Animated.Value(0), []);
  const opacity = useMemo(() => new Animated.Value(0), []);
  const cardTranslate = useMemo(() => new Animated.Value(40), []);
  const cardOpacity = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(cardTranslate, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [scale, opacity, cardTranslate, cardOpacity]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* Success Check */}
        <Animated.View
          style={[
            styles.checkCircle,
            { transform: [{ scale }], opacity },
          ]}
        >
          <Text style={styles.checkMark}>✓</Text>
        </Animated.View>

        <Animated.View style={{ opacity }}>
          <Text style={styles.title}>カレンダーに追加しました</Text>
        </Animated.View>

        {/* Event summary card */}
        <Animated.View
          style={[
            styles.summaryCard,
            {
              transform: [{ translateY: cardTranslate }],
              opacity: cardOpacity,
            },
          ]}
        >
          <Text style={styles.summaryEyebrow}>REGISTERED</Text>
          <Text style={styles.summaryName}>{event.eventName}</Text>
          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>日時</Text>
            <Text style={styles.summaryValue}>
              {formatDate(event.date)} {event.startTime}
              {event.endTime ? ` - ${event.endTime}` : ''}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>会場</Text>
            <Text style={styles.summaryValue}>{event.venue}</Text>
          </View>

          {event.address ? (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>住所</Text>
              <Text style={styles.summaryValue}>{event.address}</Text>
            </View>
          ) : null}
        </Animated.View>
      </View>

      {/* Bottom CTAs */}
      <View style={[styles.bottomCta, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={styles.btnPrimary}
          activeOpacity={0.85}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.btnPrimaryText}>ホームに戻る</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnSecondary}
          activeOpacity={0.85}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.btnSecondaryText}>続けて読み取る</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  checkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.semanticSuccess,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  checkMark: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  title: {
    ...typography.headline,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: colors.blockMint,
    borderRadius: rounded.lg,
    padding: spacing.lg,
    width: '100%',
  },
  summaryEyebrow: {
    ...typography.caption,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  summaryName: {
    ...typography.cardTitle,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.ink,
    width: 48,
    paddingTop: 2,
  },
  summaryValue: {
    ...typography.body,
    color: colors.ink,
    flex: 1,
  },

  // Bottom CTAs
  bottomCta: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: rounded.pill,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnPrimaryText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  btnSecondary: {
    backgroundColor: colors.canvas,
    borderRadius: rounded.pill,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  btnSecondaryText: {
    ...typography.button,
    color: colors.ink,
  },
});
