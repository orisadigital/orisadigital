// Reads the post-login destination from a query string.
// Only same-origin absolute paths are accepted — a crafted `next` such as
// //evil.com or https://evil.com must never be followed (open redirect).
export function safeNext(search, fallback = '/') {
  const raw = new URLSearchParams(search).get('next');
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return fallback;
  return raw;
}
