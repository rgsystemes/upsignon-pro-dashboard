export async function fetchTemplate(route, method, body) {
  const bodyText = body ? JSON.stringify(body) : undefined;
  const headers = new Headers({
    'Content-Type': 'application/json',
  });
  const res = await fetch(
    `${
      process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : process.env.PUBLIC_URL
    }${route}`,
    {
      method,
      body: bodyText,
      cache: 'no-store',
      mode: process.env.NODE_ENV === 'development' ? 'cors' : 'same-origin',
      headers,
      keepalive: true,
    },
  );
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const content = await res.text();
  if (!content) return;
  return JSON.parse(content);
}
