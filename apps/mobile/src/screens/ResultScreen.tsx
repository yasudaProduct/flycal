import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { EventData } from '../models/event';
import { colors, rounded, spacing, typography } from '../theme';
import type { ResultScreenProps } from '../types';

type FieldKey = keyof EventData;

const FIELD_LABELS: Partial<Record<FieldKey, string>> = {
  eventName: 'イベント名',
  date: '開催日',
  startTime: '開始時間',
  endTime: '終了時間',
  venue: '会場',
  address: '住所',
  performers: '出演者',
  description: '説明',
  url: 'URL',
  confidence: '信頼度',
};

const EDITABLE_FIELDS: FieldKey[] = [
  'eventName',
  'date',
  'startTime',
  'endTime',
  'venue',
  'address',
  'performers',
  'description',
];

export default function ResultScreen({ navigation, route }: ResultScreenProps) {
  const insets = useSafeAreaInsets();
  const { imageUri, event: initialEvent } = route.params;
  const [event, setEvent] = useState<EventData>({ ...initialEvent });

  const updateField = (key: FieldKey, value: string) => {
    setEvent((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddToCalendar = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    navigation.navigate('Success', { event });
  };

  const confidencePercent = Math.round(event.confidence * 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>抽出結果</Text>
        <View style={styles.backButton} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Image preview */}
          {imageUri ? (
            <View style={styles.imagePreview}>
              <Image
                source={{ uri: imageUri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
            </View>
          ) : null}

          {/* Confidence */}
          <View style={styles.confidenceBlock}>
            <Text style={styles.confidenceEyebrow}>CONFIDENCE</Text>
            <View style={styles.confidenceRow}>
              <Text style={styles.confidenceValue}>{confidencePercent}%</Text>
              <View style={styles.confidenceBarTrack}>
                <View
                  style={[
                    styles.confidenceBar,
                    { width: `${confidencePercent}%` },
                  ]}
                />
              </View>
            </View>
            <Text style={styles.confidenceCaption}>
              {confidencePercent >= 90
                ? '高い精度で読み取れました'
                : '一部の情報が不確実です。確認してください。'}
            </Text>
          </View>

          {/* Editable Fields */}
          {EDITABLE_FIELDS.map((key) => (
            <View key={key} style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{FIELD_LABELS[key]}</Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  key === 'description' && styles.fieldInputMultiline,
                ]}
                value={String(event[key])}
                onChangeText={(v) => updateField(key, v)}
                multiline={key === 'description'}
                numberOfLines={key === 'description' ? 3 : 1}
                placeholderTextColor={colors.hairline}
              />
            </View>
          ))}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCta, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={styles.btnPrimary}
          activeOpacity={0.85}
          onPress={handleAddToCalendar}
        >
          <Text style={styles.btnPrimaryText}>カレンダーに追加</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 60,
  },
  backButtonText: {
    ...typography.bodySm,
    fontWeight: '500',
    color: colors.ink,
  },
  headerTitle: {
    ...typography.headline,
    fontSize: 17,
    color: colors.ink,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },

  // Image
  imagePreview: {
    height: 180,
    borderRadius: rounded.md,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },

  // Confidence
  confidenceBlock: {
    backgroundColor: colors.blockCream,
    borderRadius: rounded.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  confidenceEyebrow: {
    ...typography.caption,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  confidenceValue: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.ink,
    letterSpacing: -0.5,
  },
  confidenceBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceBar: {
    height: '100%',
    backgroundColor: colors.semanticSuccess,
    borderRadius: 3,
  },
  confidenceCaption: {
    ...typography.bodySm,
    color: colors.ink,
  },

  // Fields
  fieldContainer: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.ink,
    marginBottom: spacing.xxs,
  },
  fieldInput: {
    ...typography.body,
    color: colors.ink,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: rounded.md,
    paddingHorizontal: 14,
    paddingVertical: spacing.sm,
  },
  fieldInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },

  // Bottom CTA
  bottomCta: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.canvas,
    borderTopWidth: 1,
    borderTopColor: colors.hairlineSoft,
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
});
