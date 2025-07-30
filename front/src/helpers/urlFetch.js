import { i18n } from '../i18n/i18n';
import { bankServerUrl, baseServerUrl } from './env';

export async function baseUrlFetch(route, method, body, useBank) {
  const bodyText = body ? JSON.stringify(body) : undefined;
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  const res = await fetch(`${useBank ? bankServerUrl : baseServerUrl}${route}`, {
    method,
    body: bodyText,
    cache: 'no-store',
    mode: process.env.NODE_ENV === 'development' ? 'cors' : 'same-origin',
    headers,
    keepalive: true,
  });
  if (!res.ok) {
    window.alert(i18n.t('request_error'));
    throw new Error(res.statusText);
  }
  const content = await res.text();
  if (!content) return;
  return JSON.parse(content);
}

export function bankUrlFetch(route, method, body) {
  return baseUrlFetch(route, method, body, true);
}
