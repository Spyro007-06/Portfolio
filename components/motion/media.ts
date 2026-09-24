"use client";

import { useSyncExternalStore } from "react";

export function useMedia(query: string, serverValue = false) {
  return useSyncExternalStore(
    (cb) => {
      const m = matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => matchMedia(query).matches,
    () => serverValue,
  );
}

/** True only for a precise pointer that can hover — where cursor/hover physics make sense. */
export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");
export const useDesktop = () => useMedia("(min-width: 1024px)");
