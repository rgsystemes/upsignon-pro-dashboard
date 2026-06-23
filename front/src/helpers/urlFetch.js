import { toast } from 'react-toastify';
import { i18n } from '../i18n/i18n';
import { bankOrResellerServerUrl, baseServerUrl, isDevelopment } from './env';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
let csrfTokenPromise;

function resetCsrfTokenCache() {
  csrfTokenPromise = undefined;
}

async function getCsrfToken() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetch(`${baseServerUrl}/csrf-token`, {
      method: 'GET',
      cache: 'no-store',
      mode: isDevelopment ? 'cors' : 'same-origin',
      credentials: isDevelopment ? 'include' : 'same-origin',
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
        resetCsrfTokenCache();
        throw error;
      });
  }

  return csrfTokenPromise;
}

async function isInvalidCsrfTokenResponse(res) {
  if (res.status !== 403) {
    return false;
  }

  try {
    const body = await res.clone().json();
    return body?.message === 'Invalid CSRF token';
  } catch (error) {
    return false;
  }
}

export async function baseUrlFetch(route, method, body, useBankOrReseller) {
  const bodyText = body ? JSON.stringify(body) : undefined;
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  const needsCsrfToken = !SAFE_METHODS.has(method.toUpperCase());
  let retryAfterCsrfRefresh = false;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (needsCsrfToken) {
      headers.set('X-CSRF-Token', await getCsrfToken());
    }

    let res;
    try {
      res = await fetch(`${useBankOrReseller ? bankOrResellerServerUrl : baseServerUrl}${route}`, {
        method,
        body: bodyText,
        cache: 'no-store',
        mode: isDevelopment ? 'cors' : 'same-origin',
        headers,
        keepalive: true,
        credentials: isDevelopment ? 'include' : 'same-origin',
      });
    } catch (error) {
      toast.error(i18n.t('network_error'));
      throw error;
    }

    if (
      !res.ok &&
      !retryAfterCsrfRefresh &&
      needsCsrfToken &&
      (await isInvalidCsrfTokenResponse(res))
    ) {
      resetCsrfTokenCache();
      retryAfterCsrfRefresh = true;
      continue;
    }

    if (!res.ok) {
      toast.error(`${i18n.t('request_error')} - ${res.status} - ${res.statusText}`);
      throw new Error(res.statusText);
    }

    try {
      const content = await res.text();
      if (!content) return;
      return JSON.parse(content);
    } catch (error) {
      toast.error(i18n.t('unknown_error'));
      throw error;
    }
  }
}

export function bankUrlFetch(route, method, body) {
  return baseUrlFetch(route, method, body, true);
}
