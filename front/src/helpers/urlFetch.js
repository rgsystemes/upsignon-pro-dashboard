import { toast } from 'react-toastify';
import { i18n } from '../i18n/i18n';
import { bankOrResellerServerUrl, baseServerUrl } from './env';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
let csrfTokenPromise;

async function getCsrfToken() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch(`${baseServerUrl}/csrf-token`, {
      method: 'GET',
      cache: 'no-store',
      mode: process.env.NODE_ENV === 'development' ? 'cors' : 'same-origin',
      credentials: process.env.NODE_ENV === 'development' ? 'include' : 'same-origin',
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`CSRF token request failed with status ${res.status}`);
        }
        const { csrfToken } = await res.json();
        if (!csrfToken) {
          throw new Error('Missing CSRF token');
        }
        return csrfToken;
      })
      .catch((error) => {
        csrfTokenPromise = undefined;
        throw error;
      });
  }

  return csrfTokenPromise;
}

export async function baseUrlFetch(route, method, body, useBankOrReseller) {
  const bodyText = body ? JSON.stringify(body) : undefined;
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  if (!SAFE_METHODS.has(method.toUpperCase())) {
    headers.set('X-CSRF-Token', await getCsrfToken());
  }
  let res;
  try {
    res = await fetch(`${useBankOrReseller ? bankOrResellerServerUrl : baseServerUrl}${route}`, {
      method,
      body: bodyText,
      cache: 'no-store',
      mode: process.env.NODE_ENV === 'development' ? 'cors' : 'same-origin',
      headers,
      keepalive: true,
      credentials: process.env.NODE_ENV === 'development' ? 'include' : 'same-origin',
    });
  } catch (e) {
    toast.error(i18n.t('network_error'));
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
    toast.error(i18n.t('unknown_error'));
    throw e;
  }
}

export function bankUrlFetch(route, method, body) {
  return baseUrlFetch(route, method, body, true);
}
