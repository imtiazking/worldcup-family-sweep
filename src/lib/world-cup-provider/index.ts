import { ApiFootballProvider } from "./api-football-provider";
import { NoopWorldCupProvider } from "./noop-provider";
import type { WorldCupDataProvider, WorldCupProviderId } from "./types";
import { getConfiguredProviderId } from "./types";

/**
 * Provider factory.
 *
 * Default: api-football when API_FOOTBALL_KEY is set.
 * Manual fallback: set WORLD_CUP_PROVIDER=noop to disable automated sync.
 */
export function createWorldCupProvider(): WorldCupDataProvider {
  const providerId = getConfiguredProviderId();

  switch (providerId) {
    case "api-football": {
      if (!process.env.API_FOOTBALL_KEY) {
        console.warn(
          "[world-cup-provider] WORLD_CUP_PROVIDER=api-football but API_FOOTBALL_KEY is missing. Using noop."
        );
        return new NoopWorldCupProvider();
      }
      return new ApiFootballProvider();
    }
    case "noop":
      return new NoopWorldCupProvider();
    case "custom":
      console.warn(
        '[world-cup-provider] WORLD_CUP_PROVIDER=custom is not implemented. Using noop.'
      );
      return new NoopWorldCupProvider();
    default:
      return new NoopWorldCupProvider();
  }
}

export function getProviderStatus(): {
  providerId: WorldCupProviderId;
  wired: boolean;
  hasApiKey: boolean;
} {
  const providerId = getConfiguredProviderId();
  const hasApiKey = Boolean(process.env.API_FOOTBALL_KEY);
  const wired = providerId === "api-football" && hasApiKey;

  return { providerId, wired, hasApiKey };
}
