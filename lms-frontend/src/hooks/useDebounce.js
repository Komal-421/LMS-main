import { useEffect, useState } from 'react';

/**
 * Delays updating a value until after `delay` ms of inactivity.
 * Used for search inputs to prevent redundant filtering or API work on every keystroke.
 */
export function useDebounce(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
