export const NAVIGATION_START_EVENT = "recruitimate:navigation-start";

export function notifyNavigationStart() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(NAVIGATION_START_EVENT));
  }
}
