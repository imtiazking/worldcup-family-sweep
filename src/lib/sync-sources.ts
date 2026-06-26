export const SYNC_SOURCE_LIVE = "api-football-live";
export const SYNC_SOURCE_FALLBACK = "verified-snapshot-fallback";
export const SYNC_SOURCE_API_ERROR = "api-football-error";

export type SyncSource =
  | typeof SYNC_SOURCE_LIVE
  | typeof SYNC_SOURCE_FALLBACK
  | typeof SYNC_SOURCE_API_ERROR
  | string;

export function formatSyncSourceLabel(source: string): string {
  switch (source) {
    case SYNC_SOURCE_LIVE:
      return "API-Football Live";
    case SYNC_SOURCE_FALLBACK:
      return "Verified snapshot (API fallback)";
    case SYNC_SOURCE_API_ERROR:
      return "Verified snapshot (API error)";
    default:
      return source;
  }
}
