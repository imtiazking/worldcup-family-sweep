import { NoopWorldCupProvider } from "./noop-provider";
import type { WorldCupDataProvider, WorldCupProviderId } from "./types";
import { getConfiguredProviderId } from "./types";

/**
 * Provider factory — add concrete implementations here.
 *
 * Example future wiring:
 *   case "api-football":
 *     return new ApiFootballProvider(process.env.API_FOOTBALL_KEY!);
 */
export function createWorldCupProvider(): WorldCupDataProvider {
  const providerId = getConfiguredProviderId();

  switch (providerId) {
    case "api-football":
    case "custom":
      // Placeholder: fall back to noop until implemented
      console.warn(
        `[world-cup-provider] Provider "${providerId}" is not implemented yet. Using noop.`
      );
      return new NoopWorldCupProvider();
    case "noop":
    default:
      return new NoopWorldCupProvider();
  }
}

export function getProviderStatus(): {
  providerId: WorldCupProviderId;
  wired: boolean;
} {
  const providerId = getConfiguredProviderId();
  const wired = providerId === "noop";

  return { providerId, wired };
}
