/**
 * Retry wrapper with exponential backoff
 */
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: { retries?: number; baseDelay?: number } = {}
): Promise<T> {
  const { retries = 3, baseDelay = 1000 } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < retries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Safe fetch that returns fallback on error
 */
export async function safeFetch<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.warn('safeFetch error, using fallback:', error);
    return fallback;
  }
}

/**
 * Safe fetch with retry, returns fallback on final failure
 */
export async function safeFetchWithRetry<T>(
  fn: () => Promise<T>,
  fallback: T,
  options?: { retries?: number; baseDelay?: number }
): Promise<T> {
  try {
    return await fetchWithRetry(fn, options);
  } catch (error) {
    console.warn('safeFetchWithRetry exhausted retries, using fallback:', error);
    return fallback;
  }
}
