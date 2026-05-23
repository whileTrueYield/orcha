export function JsonParse<T>(
  value: string | null | undefined,
  defaultValue: T
): T {
  if (value) {
    try {
      const jsonValue = JSON.parse(value);
      return jsonValue || defaultValue;
    } catch {
      // do nothing
    }
  }

  return defaultValue;
}
