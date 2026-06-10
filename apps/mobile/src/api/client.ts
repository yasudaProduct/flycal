import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "../config";
import type { ApiEventInfo, EventData } from "../models/event";
import { toEventData } from "../models/event";

// ---- 匿名ユーザーID（docs/api-design.md 2.3） -------------------------------

const ANON_ID_KEY = "flycal.anonymousId";
let cachedAnonymousId: string | null = null;

/** crypto.randomUUID が無い環境向けの簡易 UUID v4 生成 */
function generateUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** 端末固有の匿名IDを取得（無ければ生成して永続化） */
export async function getAnonymousId(): Promise<string> {
  if (cachedAnonymousId) return cachedAnonymousId;

  const stored = await AsyncStorage.getItem(ANON_ID_KEY);
  if (stored) {
    cachedAnonymousId = stored;
    return stored;
  }

  const generated = generateUuid();
  await AsyncStorage.setItem(ANON_ID_KEY, generated);
  cachedAnonymousId = generated;
  return generated;
}

// ---- レスポンス型（docs/api-design.md 5） ----------------------------------

interface UsageInfo {
  yearMonth: string;
  analysisCount: number;
  limit: number;
}

interface AnalyzeResponse {
  analysisId: string;
  event: ApiEventInfo;
  candidates: unknown[];
  usage: UsageInfo;
}

export interface UsageResponse extends UsageInfo {
  remaining: number;
}

/** バックエンドの共通エラー形式（docs/api-design.md 3.2）に対応する例外 */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as {
      error?: { code?: string; message?: string };
    };
    return new ApiError(
      body.error?.code ?? "INTERNAL_ERROR",
      body.error?.message ?? "エラーが発生しました。",
      res.status,
    );
  } catch {
    return new ApiError("INTERNAL_ERROR", `通信に失敗しました (${res.status})`, res.status);
  }
}

// ---- エンドポイント --------------------------------------------------------

/** 画像から推定される MIME タイプ（拡張子ベース） */
function guessMimeType(uri: string): string {
  const ext = uri.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    default:
      return "image/jpeg";
  }
}

/** POST /api/v1/analyze — 画像からイベント情報を抽出 */
export async function analyzeImage(
  imageUri: string,
  hint?: string,
): Promise<EventData> {
  const anonymousId = await getAnonymousId();

  const form = new FormData();
  form.append("image", {
    uri: imageUri,
    name: `flyer.${imageUri.split(".").pop() ?? "jpg"}`,
    type: guessMimeType(imageUri),
  } as unknown as Blob);
  if (hint) {
    form.append("hint", hint);
  }

  const res = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: { "X-Anonymous-Id": anonymousId },
    body: form,
  });

  if (!res.ok) {
    throw await parseError(res);
  }

  const data = (await res.json()) as AnalyzeResponse;
  return toEventData(data.event);
}

/** GET /api/v1/usage — 当月の利用状況を取得 */
export async function fetchUsage(): Promise<UsageResponse> {
  const anonymousId = await getAnonymousId();
  const res = await fetch(`${API_URL}/usage`, {
    headers: { "X-Anonymous-Id": anonymousId },
  });
  if (!res.ok) {
    throw await parseError(res);
  }
  return (await res.json()) as UsageResponse;
}
