import { useEffect, useState, useMemo } from "react";

type DebouncedState<T> = [
  // the debounced value
  T,
  // set the debounced value
  (value: T) => void,
  // the live value
  T,
  // set the live value;
  (value: T) => void
];

/**
 * Return a value that will be debounced, useful to prevent DB request flood
 *
 * Most common usage is:
 * ```ts
 * const [
 *   query,
 *   setQuery,
 * ] = useDebouncedState("", 500, onQueryChange);
 * ```
 *
 * You can then use `query` to display the live change of the value
 * and `setQuery()` to set that live value. The value of `debouncedQuery`
 * will be assigned after 500ms after the last call of `setQuery()`.
 *
 * ```tsx
 * <input
 *   onChange={(event) => setQuery(event.current.value)}
 *   value={query}
 * />
 * ```
 *
 * and the onQueryChange callback, receiving the debounced value
 *
 * ```ts
 * const onQueryChange = (query: string) => {
 *  if(query.trim().length > 0) {
 *    getTickets({variables: {query}})
 *  }
 * }
 * ```
 *
 * @param initialValue The initial value
 * @param delay Debounce delay value, in milliseconds
 * @param onChange Called when debounced value is set with a new value
 */
export const useDebouncedState = <T>(
  initialValue: T,
  delay: number = 500,
  onChange?: (value: T) => any
): DebouncedState<T> => {
  const [_debouncedValue, _debouncedSetValue] = useState(initialValue);
  const [value, setValue] = useState(initialValue);

  const debouncedSetValue = useMemo(
    () => (newValue: T) => {
      if (newValue !== _debouncedValue) {
        setValue(newValue);
        _debouncedSetValue(newValue);
        if (onChange) {
          onChange(newValue);
        }
      }
    },
    [_debouncedSetValue, setValue, onChange, _debouncedValue]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      debouncedSetValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, debouncedSetValue, delay]);

  return [value, setValue, _debouncedValue, debouncedSetValue];
};
