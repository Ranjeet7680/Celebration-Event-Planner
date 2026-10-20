import { useState, useEffect } from "react";

/**
 * useDebounce hook
 * Delays updating the debounced value until after the specified delay has elapsed
 * since the last time the debounced value was changed.
 *
 * @param value The value to debounce
 * @param delay Milliseconds to delay (default 300ms)
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
