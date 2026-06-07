import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MOCK_HISTORY } from "../mockData";
import { colors, rounded, spacing, typography } from "../theme";
import type { HomeScreenProps } from "../types";

const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      navigation.navigate("Analyzing", { imageUri: result.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("カメラへのアクセスを許可してください");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      navigation.navigate("Analyzing", { imageUri: result.assets[0].uri });
    }
  };

  const nearestEvent = MOCK_HISTORY[0];
  const nearestDate = new Date(nearestEvent.date);
  const nearestFormatted = `${nearestDate.getMonth() + 1}/${nearestDate.getDate()} (${WEEKDAYS[nearestDate.getDay()]})`;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoArea}>
          <View style={styles.logoBox}>
            <Text style={styles.logoMark}>✓</Text>
          </View>
          <Text style={styles.appName}>FlyCal</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("History")}
          >
            <Text style={styles.iconSymbol}>⏱</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconSymbol}>⚙</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Title */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>{"これから行く\nイベント"}</Text>
          <Text style={styles.heroSubtext}>
            {MOCK_HISTORY.length}件保存済み · 直近 {nearestFormatted}
          </Text>
        </View>

        {/* Event List */}
        {MOCK_HISTORY.map((event, i) => {
          const d = new Date(event.date);
          const day = d.getDate();
          const monthLabel = MONTH_LABELS[d.getMonth()];
          const weekday = WEEKDAYS[d.getDay()];

          return (
            <TouchableOpacity
              key={i}
              style={styles.eventRow}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate("Result", { imageUri: "", event })
              }
            >
              {/* Date column */}
              <View style={styles.dateCol}>
                <Text style={styles.dateDay}>{day}</Text>
                <Text style={styles.dateMonth}>{monthLabel}</Text>
                <Text style={styles.dateWeekday}>{weekday}</Text>
              </View>

              {/* Thumbnail */}
              <View
                style={[
                  styles.thumbnail,
                  {
                    backgroundColor: event.thumbnailColor || colors.surfaceSoft,
                  },
                ]}
              >
                <Text style={styles.thumbnailText}>
                  {event.thumbnailLabel || event.eventName.slice(0, 4)}
                </Text>
              </View>

              {/* Event info */}
              <View style={styles.eventInfo}>
                <Text style={styles.eventCategory}>
                  {event.category || "イベント"}
                </Text>
                <Text style={styles.eventName}>{event.eventName}</Text>
                <Text style={styles.eventVenue}>📍 {event.venue}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom CTA Bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom || spacing.md },
        ]}
      >
        <TouchableOpacity
          style={styles.addButtonWrapper}
          activeOpacity={0.85}
          onPress={pickImage}
        >
          <LinearGradient
            colors={["#F0785A", "#F4A472"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButton}
          >
            <Text style={styles.addButtonIcon}>✦</Text>
            <Text style={styles.addButtonText}>選択</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cameraButtonWrapper}
          activeOpacity={0.85}
          onPress={takePhoto}
        >
          <View style={styles.cameraButton}>
            <Text style={styles.cameraButtonIcon}>📷</Text>
            <Text style={styles.cameraButtonText}>撮影</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  logoArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  logoBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: "#E8402A",
    alignItems: "center",
    justifyContent: "center",
  },
  logoMark: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "700",
  },
  appName: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.3,
  },
  headerIcons: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
  },
  iconSymbol: {
    fontSize: 15,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },

  // Hero
  heroSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.ink,
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  heroSubtext: {
    ...typography.bodySm,
    color: colors.ink,
    opacity: 0.5,
  },

  // Event Row
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },

  // Date Column
  dateCol: {
    width: 40,
    alignItems: "center",
  },
  dateDay: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.ink,
    lineHeight: 32,
  },
  dateMonth: {
    ...typography.caption,
    color: colors.ink,
    opacity: 0.5,
    lineHeight: 14,
  },
  dateWeekday: {
    ...typography.caption,
    color: colors.ink,
    opacity: 0.4,
    lineHeight: 14,
  },

  // Thumbnail
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: rounded.md,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbnailText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.ink,
    textAlign: "center",
    lineHeight: 13,
    opacity: 0.7,
  },

  // Event Info
  eventInfo: {
    flex: 1,
  },
  eventCategory: {
    ...typography.caption,
    color: "#F0652A",
    marginBottom: 2,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  eventVenue: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.ink,
    opacity: 0.5,
  },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surfaceSoft,
  },
  addButtonWrapper: {
    flex: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rounded.pill,
    paddingVertical: 16,
    gap: spacing.xs,
  },
  addButtonIcon: {
    fontSize: 16,
    color: colors.onPrimary,
  },
  addButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
  cameraButtonWrapper: {
    flex: 1,
  },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: rounded.pill,
    paddingVertical: 16,
    gap: spacing.xs,
    backgroundColor: colors.ink,
  },
  cameraButtonIcon: {
    fontSize: 16,
  },
  cameraButtonText: {
    ...typography.button,
    color: colors.onPrimary,
  },
});
