import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { EventData } from './models/event';

export type RootStackParamList = {
  Home: undefined;
  Analyzing: { imageUri: string };
  Result: { imageUri: string; event: EventData };
  Success: { event: EventData };
  History: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type AnalyzingScreenProps = NativeStackScreenProps<RootStackParamList, 'Analyzing'>;
export type ResultScreenProps = NativeStackScreenProps<RootStackParamList, 'Result'>;
export type SuccessScreenProps = NativeStackScreenProps<RootStackParamList, 'Success'>;
export type HistoryScreenProps = NativeStackScreenProps<RootStackParamList, 'History'>;
