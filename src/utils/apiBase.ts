/**
 * Single source of truth for the backend API origin.
 *
 * NOTE: the module-scope `window` read is intentional for now and preserves the
 * prior behavior. PR 5 migrates this to `import.meta.env.VITE_API_BASE` to unblock
 * SSG/prerendering and make the origin configurable per environment.
 */
export const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://api.nindroidsystems.com";
