import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MOCK_HISTORY } from '../mockData';
import { colors, rounded, spacing, typography } from '../theme';
import type { HomeScreenProps } from '../types';

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      navigation.navigate('Analyzing', { imageUri: result.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('カメラへのアクセスを許可してください');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      navigation.navigate('Analyzing', { imageUri: result.assets[0].uri });
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return `${d.getMonth() + 1}/${d.getDate()}（${weekdays[d.getDay()]}）`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>FlyCal</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.historyButtonText}>履歴</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroEyebrow}>AI POWERED</Text>
          <Text style={styles.heroTitle}>{'フライヤーを\nカレンダーに。'}</Text>
          <Text style={styles.heroSubtext}>
            画像を選ぶだけで、AIがイベント情報を読み取って予定に追加します。
          </Text>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.btnPrimary}
            activeOpacity={0.85}
            onPress={pickImage}
          >
            <Text style={styles.btnPrimaryText}>画像を選ぶ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSecondary}
            activeOpacity={0.85}
            onPress={takePhoto}
          >
            <Text style={styles.btnSecondaryText}>カメラで撮影</Text>
          </TouchableOpacity>
        </View>

        {/* Tip - Lime Color Block */}
        <View style={styles.tipBlock}>
          <Text style={styles.tipEyebrow}>TIPS</Text>
          <Text style={styles.tipTitle}>スクショもそのままOK</Text>
          <Text style={styles.tipBody}>
            SNSで保存したフライヤー画像や、Webページのスクリーンショットからも読み取れます。
          </Text>
        </View>

        {/* Recent Events */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>最近のイベント</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.sectionLink}>すべて見る</Text>
          </TouchableOpacity>
        </View>

        {MOCK_HISTORY.slice(0, 2).map((event, i) => (
          <TouchableOpacity
            key={i}
            style={styles.eventCard}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('Result', {
                imageUri: '',
                event,
              })
            }
          >
            <View style={styles.eventCardLeft}>
              <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
              <Text style={styles.eventTime}>{event.startTime}</Text>
            </View>
            <View style={styles.eventCardRight}>
              <Text style={styles.eventName}>{event.eventName}</Text>
              <Text style={styles.eventVenue}>{event.venue}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Usage Info - Lilac Color Block */}
        <View style={styles.usageBlock}>
          <Text style={styles.usageEyebrow}>FREE PLAN</Text>
          <Text style={styles.usageTitle}>今月の利用</Text>
          <View style={styles.usageRow}>
            <Text style={styles.usageCount}>2</Text>
            <Text style={styles.usageTotal}> / 5 回</Text>
          </View>
          <Text style={styles.usageBody}>
            無料プランでは月5回まで解析できます。
          </Text>
        </View>

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
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  historyButton: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: rounded.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  historyButtonText: {
    ...typography.bodySm,
    fontWeight: '500',
    color: colors.ink,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },

  // Hero
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  heroEyebrow: {
    ...typography.eyebrow,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  heroTitle: {
    ...typography.displayXl,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  heroSubtext: {
    ...typography.bodyLg,
    color: colors.ink,
  },

  // CTA
  ctaSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: rounded.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimaryText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  btnSecondary: {
    backgroundColor: colors.canvas,
    borderRadius: rounded.pill,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  btnSecondaryText: {
    ...typography.button,
    color: colors.ink,
  },

  // Tip Block (lime)
  tipBlock: {
    backgroundColor: colors.blockLime,
    borderRadius: rounded.lg,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  tipEyebrow: {
    ...typography.caption,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  tipTitle: {
    ...typography.headline,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  tipBody: {
    ...typography.body,
    color: colors.ink,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.headline,
    color: colors.ink,
  },
  sectionLink: {
    ...typography.bodySm,
    fontWeight: '500',
    color: colors.ink,
  },

  // Event Card
  eventCard: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairlineSoft,
    gap: spacing.md,
  },
  eventCardLeft: {
    width: 56,
  },
  eventDate: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.ink,
  },
  eventTime: {
    ...typography.caption,
    color: colors.ink,
    marginTop: spacing.xxs,
  },
  eventCardRight: {
    flex: 1,
  },
  eventName: {
    ...typography.cardTitle,
    fontSize: 17,
    color: colors.ink,
    marginBottom: spacing.xxs,
  },
  eventVenue: {
    ...typography.bodySm,
    color: colors.ink,
  },

  // Usage Block (lilac)
  usageBlock: {
    backgroundColor: colors.blockLilac,
    borderRadius: rounded.lg,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  usageEyebrow: {
    ...typography.caption,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  usageTitle: {
    ...typography.headline,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  usageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  usageCount: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.ink,
    letterSpacing: -1,
  },
  usageTotal: {
    ...typography.bodyLg,
    color: colors.ink,
  },
  usageBody: {
    ...typography.bodySm,
    color: colors.ink,
  },
});
