import { toast } from 'react-toastify';
import { i18n } from '../i18n/i18n';
import { bankOrResellerServerUrl, baseServerUrl } from './env';

export async function baseUrlFetch(route, method, body, useBankOrReseller) {
  const bodyText = body ? JSON.stringify(body) : undefined;
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  let res;
  try {
    res = await fetch(`${useBankOrReseller ? bankOrResellerServerUrl : baseServerUrl}${route}`, {
      method,
      body: bodyText,
      cache: 'no-store',
      mode: process.env.NODE_ENV === 'development' ? 'cors' : 'same-origin',
      headers,
      keepalive: true,
    });
  } catch (e) {
    toast.error(`${i18n.t('network_error')}`);
    throw e;
  }
  if (!res.ok) {
    toast.error(`${i18n.t('request_error')} - ${res.status} - ${res.statusText}`);
    throw new Error(res.statusText);
  }
  try {
    const content = await res.text();
    if (!content) return;
    return JSON.parse(content);
  } catch (e) {
    toast.error(`${i18n.t('unknown_error')}`);
    throw e;
  }
}

export function bankUrlFetch(route, method, body) {
  return baseUrlFetch(route, method, body, true);
}
