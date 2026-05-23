export const getCachedQuery = (documentationId: string) =>
  localStorage.getItem(`query:${documentationId}`) || "";
export const setCachedQuery = (documentationId: string, query: string) =>
  localStorage.setItem(`query:${documentationId}`, query);

export const getCachedResults = (documentationId: string): string[] => {
  try {
    const cachedResultStr =
      localStorage.getItem(`results:${documentationId}`) || "[]";
    return JSON.parse(cachedResultStr);
  } catch {
    return [];
  }
};
export const setCachedResults = (
  documentationId: string,
  results: string[]
) => {
  localStorage.setItem(`results:${documentationId}`, JSON.stringify(results));
};

export const setCachedDescription = (
  productId: string,
  description: string
) => {
  localStorage.setItem(`description:${productId}`, description);
};

export const getCachedDescription = (productId: string): string =>
  localStorage.getItem(`description:${productId}`) || "";
