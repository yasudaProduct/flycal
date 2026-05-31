import type { EventData } from './types';

export const MOCK_EVENT: EventData = {
  eventName: 'NEON OASIS vol.04',
  date: '2026-06-28',
  startTime: '22:00',
  endTime: '05:00',
  venue: 'WOMB',
  address: '東京都渋谷区円山町2-16',
  performers: 'NABLUS / mno / sara.jp / KEINA',
  description: 'エレクトロニックミュージックイベント。ネオンカラーに彩られた空間で最高の一夜を。',
  url: 'https://example.com/neon-oasis',
  confidence: 0.92,
};

export const MOCK_HISTORY: EventData[] = [
  MOCK_EVENT,
  {
    eventName: '夜想曲 NOCTURNE FES 2026',
    date: '2026-07-12',
    startTime: '14:00',
    endTime: '21:00',
    venue: '日比谷野外音楽堂',
    address: '東京都千代田区日比谷公園1-5',
    performers: '青葉市子 / haruka nakamura / 原摩利彦',
    description: '夏の夕暮れに贈るアンビエントミュージックフェスティバル。',
    url: '',
    confidence: 0.88,
  },
  {
    eventName: 'SUMMER SONIC 2026',
    date: '2026-08-15',
    startTime: '11:00',
    endTime: '23:00',
    venue: 'ZOZOマリンスタジアム',
    address: '千葉県千葉市美浜区美浜1',
    performers: 'Arctic Monkeys / Charli XCX / NewJeans',
    description: '国内最大級の都市型ロックフェスティバル。',
    url: 'https://example.com/summersonic',
    confidence: 0.95,
  },
];
