import { groupServerUrl, baseServerUrl } from './env';

export async function fetchTemplate(route, method, body, options) {
  const bodyText = body ? JSON.stringify(body) : undefined;
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  const res = await fetch(`${options?.useBaseUrl ? baseServerUrl : groupServerUrl}${route}`, {
    method,
    body: bodyText,
    cache: 'no-store',
    mode: process.env.NODE_ENV === 'development' ? 'cors' : 'same-origin',
    headers,
    keepalive: true,
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const content = await res.text();
  if (!content) return;
  return JSON.parse(content);
}

export function adminFetchTemplate(route, method, body) {
  return fetchTemplate(route, method, body, { useBaseUrl: true });
}
