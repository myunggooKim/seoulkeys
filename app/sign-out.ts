/**
 * Signing out has to undo three separate things, which is why clearing the
 * cookie alone left people logged back in on their next visit:
 *
 *  1. the server session cookie,
 *  2. any page the service worker cached while the user was signed in,
 *  3. Google Identity Services' remembered account, which will otherwise
 *     re-authenticate silently the next time the sign-in button initialises.
 */
export async function signOutEverywhere(signOutPath = "/api/auth/signout") {
  try {
    await fetch(signOutPath, { method: "POST", cache: "no-store", credentials: "same-origin" });
  } catch {
    // Even if the request failed, still clear local state below.
  }

  try {
    const google = (window as typeof window & {
      google?: { accounts?: { id?: { disableAutoSelect?: () => void } } };
    }).google;
    google?.accounts?.id?.disableAutoSelect?.();
  } catch {
    // GIS may not be loaded on this page.
  }

  try {
    window.localStorage.setItem(signedOutFlagKey, "1");
  } catch {
    // Storage can be denied; the cookie clear is still authoritative.
  }

  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {
    // Cache API unavailable.
  }

  // Full document load, not a client-side route change, so nothing renders from
  // the router cache with the old session still in it.
  window.location.replace("/");
}

export const signedOutFlagKey = "seoulkeys-signed-out";

/** Cleared as soon as the user deliberately signs in again. */
export function clearSignedOutFlag() {
  try {
    window.localStorage.removeItem(signedOutFlagKey);
  } catch {
    // no-op
  }
}

export function wasDeliberatelySignedOut(): boolean {
  try {
    return window.localStorage.getItem(signedOutFlagKey) === "1";
  } catch {
    return false;
  }
}
