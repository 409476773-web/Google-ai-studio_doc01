import { useEffect, useRef, type RefObject } from "react";

export type DefaultResetEntry = readonly [HTMLInputElement, boolean];

export function useDefaultReset(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean,
  getEntries: () => DefaultResetEntry[],
  onReset: () => void,
): void {
  const getEntriesRef = useRef(getEntries);
  const onResetRef = useRef(onReset);
  getEntriesRef.current = getEntries;
  onResetRef.current = onReset;

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    const form =
      "form" in node && node.form instanceof HTMLFormElement
        ? node.form
        : node.closest("form");
    if (!form) return;

    const handleReset = () => {
      queueMicrotask(() => {
        for (const [input, defaultChecked] of getEntriesRef.current()) {
          if (input) {
            input.defaultChecked = defaultChecked;
          }
        }
        onResetRef.current();
      });
    };

    form.addEventListener("reset", handleReset);
    return () => {
      form.removeEventListener("reset", handleReset);
    };
  }, [ref, enabled]);
}
