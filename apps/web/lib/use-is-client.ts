import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False on the server and during the first render in the browser, true afterwards.
 * Lets a component wait for browser-only data (like the saved basket) without a hydration error.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
