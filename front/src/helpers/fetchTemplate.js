export async function fetchTemplate(route, method, body) {
  const res = await fetch(
    `${process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : ''}${route}`,
    {
      method,
      body,
      cache: 'no-store',
      mode: process.env.NODE_ENV === 'development' ? 'cors' : 'same-origin',
    },
  );
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const content = await res.text();
  if (!content) return;
  return JSON.parse(content);
}
