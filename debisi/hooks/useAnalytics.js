import { useEffect } from "react";
import { analytics } from "@/config/firebase";
import { logEvent } from "firebase/analytics";

/**
 * Logs a Firebase Analytics event safely (browser-only).
 *
 * Usage:
 *   useAnalytics("page_view", { page_title: "Home" });
 *   useAnalytics("select_item", { item_id: product.id, item_name: product.title });
 */
export function useAnalytics(eventName, eventParams = {}) {
  useEffect(() => {
    analytics.then((instance) => {
      if (instance) {
        logEvent(instance, eventName, eventParams);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName]);
}

/**
 * Fire a one-off analytics event imperatively (e.g. on button click).
 */
export async function trackEvent(eventName, eventParams = {}) {
  const instance = await analytics;
  if (instance) {
    logEvent(instance, eventName, eventParams);
  }
}
