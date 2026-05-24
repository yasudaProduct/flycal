import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.logoArea}>
          <View style={styles.logoBox}>
            <Text style={styles.logoMark}>✓</Text>
          </View>
          <Text style={styles.appName}>FlyCal</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
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
        {/* ヒーローカード */}
        <View style={styles.heroPadding}>
          <LinearGradient
            colors={['#F0785A', '#F4A472']}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroDecorCircle} />

            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>✦ AI POWERED</Text>
            </View>

            <Text style={styles.heroTitle}>{'フライヤーを\nカレンダーに。'}</Text>

            <Text style={styles.heroSubtext}>
              {'画像を選ぶだけで、AIがイベント情報を読\nみ取って予定に追加します。'}
            </Text>

            <View style={styles.heroButtons}>
              <TouchableOpacity style={styles.btnWhite} activeOpacity={0.85}>
                <Text style={styles.btnWhiteText}>🖼 画像から</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnOrange} activeOpacity={0.85}>
                <Text style={styles.btnOrangeText}>📷 撮影</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* ヒントバー */}
        <View style={styles.tipRow}>
          <View style={styles.tipIconBox}>
            <Text style={styles.tipIconText}>↗</Text>
          </View>
          <View style={styles.tipTextBox}>
            <Text style={styles.tipTitle}>スクショもそのままOK</Text>
            <Text style={styles.tipSubtext}>SNSで保存したフライヤーを読み込めます</Text>
          </View>
        </View>

        {/* 最近のイベント セクションヘッダー */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>最近のイベント</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>すべて →</Text>
          </TouchableOpacity>
        </View>

        {/* イベントカード */}
        <View style={styles.eventCards}>
          {/* NEON OASIS */}
          <View style={styles.eventCard}>
            <View style={[styles.eventImageArea, { backgroundColor: '#1A0A2E' }]}>
              <Text style={styles.neonSubLabel}>{'NABLUS · mno · sara.jp · KEINA'}</Text>
              <Text style={styles.neonTitle}>{'NEON\nOASIS'}</Text>
              <Text style={styles.neonSubTag}>vol.04</Text>
              <Text style={styles.neonDate}>{'2026.06.28 SAT'}</Text>
            </View>
            <Text style={styles.eventName}>NEON OASIS vol.04</Text>
            <Text style={styles.eventDate}>6/28（土） · 22:00</Text>
          </View>

          {/* 夜想曲 */}
          <View style={styles.eventCard}>
            <View style={[styles.eventImageArea, { backgroundColor: '#F0EDE0' }]}>
              <Text style={styles.nocturneTitle}>夜想曲</Text>
              <Text style={styles.nocturneMoon}>🌙</Text>
              <Text style={styles.nocturneSubtitle}>{'NOCTURNE FEO 2026'}</Text>
              <Text style={styles.nocturneDate}>{'2026.07.12 SUN'}</Text>
            </View>
            <Text style={styles.eventName}>夜想曲 NOCTURNE</Text>
            <Text style={styles.eventDate}>7/12（日） · 14:00</Text>
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ボトムバー */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarInner}>
          <View style={styles.bottomBarLeft}>
            <View style={styles.calIconBox}>
              <Text style={styles.calIconText}>📅</Text>
            </View>
            <View>
              <Text style={styles.bottomBarLabel}>今月の登録</Text>
              <Text style={styles.bottomBarValue}>7件のイベント</Text>
            </View>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },

  // ヘッダー
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#E8402A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.3,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSymbol: {
    fontSize: 15,
  },

  // スクロール
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // ヒーローカード
  heroPadding: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    paddingTop: 20,
    overflow: 'hidden',
  },
  heroDecorCircle: {
    position: 'absolute',
    right: -40,
    top: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  aiBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.20)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  aiBadgeText: {
    color: '#B8FFCC',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 38,
    marginBottom: 10,
  },
  heroSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: 20,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  btnWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnWhiteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  btnOrange: {
    flex: 1,
    backgroundColor: '#E8592A',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnOrangeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ヒントバー
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tipIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipIconText: {
    fontSize: 16,
    color: '#F0652A',
    fontWeight: '700',
  },
  tipTextBox: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  tipSubtext: {
    fontSize: 12,
    color: '#888888',
  },

  // セクションヘッダー
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F0652A',
  },

  // イベントカード
  eventCards: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  eventCard: {
    width: CARD_WIDTH,
  },
  eventImageArea: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.25,
    borderRadius: 14,
    marginBottom: 8,
    padding: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },

  // NEON OASIS card content
  neonSubLabel: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    fontSize: 7,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.3,
  },
  neonTitle: {
    position: 'absolute',
    bottom: 30,
    left: 10,
    fontSize: 22,
    fontWeight: '900',
    color: '#FF3A5C',
    lineHeight: 25,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(255,100,50,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  neonSubTag: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
  },
  neonDate: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    fontSize: 8,
    color: 'rgba(255,255,255,0.5)',
  },

  // 夜想曲 card content
  nocturneTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2A2A2A',
    marginBottom: 4,
  },
  nocturneMoon: {
    fontSize: 36,
    marginBottom: 4,
  },
  nocturneSubtitle: {
    fontSize: 8,
    color: '#666666',
    letterSpacing: 0.5,
  },
  nocturneDate: {
    fontSize: 8,
    color: '#888888',
    marginTop: 2,
  },

  // イベント情報
  eventName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 3,
  },
  eventDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F0652A',
  },

  // ボトムバー
  bottomBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF0EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calIconText: {
    fontSize: 18,
  },
  bottomBarLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 1,
  },
  bottomBarValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  chevron: {
    fontSize: 24,
    color: '#CCCCCC',
    fontWeight: '300',
  },
});
