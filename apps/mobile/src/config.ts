import Constants from "expo-constants";

/**
 * バックエンド API のベース URL を解決する。
 * 優先順位:
 *   1. app.json の expo.extra.apiBaseUrl（明示指定）
 *   2. Expo Dev Server のホストから導出（実機・シミュレータから LAN 経由で到達可能）
 *   3. http://localhost:8787（フォールバック）
 *
 * 本番ビルドでは expo.extra.apiBaseUrl にデプロイ先 URL を設定する想定。
 */
function resolveBaseUrl(): string {
  const fromExtra = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof fromExtra === "string" && fromExtra.length > 0) {
    return fromExtra;
  }

  // 例: "192.168.1.10:8081" → "http://192.168.1.10:8787"
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig
      ?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(":")[0];
    if (host) {
      return `http://${host}:8787`;
    }
  }

  return "http://localhost:8787";
}

export const API_BASE_URL = resolveBaseUrl();
export const API_URL = `${API_BASE_URL}/api/v1`;
