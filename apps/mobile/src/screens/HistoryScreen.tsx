import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MOCK_HISTORY } from '../mockData';
import { colors, rounded, spacing, typography } from '../theme';
import type { HistoryScreenProps } from '../types';

const BLOCK_COLORS = [colors.blockCoral, colors.blockLilac, colors.blockCream];

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const insets = useSafeAreaInsets();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return `${d.getMonth() + 1}/${d.getDate()}（${weekdays[d.getDay()]}）`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>履歴</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>読み取り履歴</Text>
        <Text style={styles.pageSubtext}>
          過去に読み取ったイベント情報の一覧です。
        </Text>

        {MOCK_HISTORY.map((event, i) => (
          <TouchableOpacity
            key={i}
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('Result', { imageUri: '', event })
            }
          >
            {/* Color accent */}
            <View
              style={[
                styles.cardAccent,
                { backgroundColor: BLOCK_COLORS[i % BLOCK_COLORS.length] },
              ]}
            />
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>
                  {formatDate(event.date)} {event.startTime}
                </Text>
                <Text style={styles.cardConfidence}>
                  {Math.round(event.confidence * 100)}%
                </Text>
              </View>
              <Text style={styles.cardName}>{event.eventName}</Text>
              <Text style={styles.cardVenue}>{event.venue}</Text>
              {event.performers ? (
                <Text style={styles.cardPerformers} numberOfLines={1}>
                  {event.performers}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backText: {
    ...typography.bodySm,
    fontWeight: '500',
    color: colors.ink,
  },
  headerTitle: {
    ...typography.headline,
    fontSize: 17,
    color: colors.ink,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  pageTitle: {
    ...typography.displayLg,
    fontSize: 32,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  pageSubtext: {
    ...typography.body,
    color: colors.ink,
    marginBottom: spacing.xl,
  },

  // Card
  card: {
    flexDirection: 'row',
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: rounded.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  cardAccent: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  cardDate: {
    ...typography.caption,
    color: colors.ink,
  },
  cardConfidence: {
    ...typography.caption,
    color: colors.semanticSuccess,
  },
  cardName: {
    ...typography.cardTitle,
    fontSize: 18,
    color: colors.ink,
    marginBottom: spacing.xxs,
  },
  cardVenue: {
    ...typography.bodySm,
    color: colors.ink,
    marginBottom: spacing.xxs,
  },
  cardPerformers: {
    ...typography.bodySm,
    color: colors.ink,
    opacity: 0.6,
  },
});
