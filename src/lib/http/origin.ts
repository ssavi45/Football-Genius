const loopbackHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]']);

export function checkSameOrigin(request: Request, development = process.env.NODE_ENV !== 'production') {
  const origin = request.headers.get('origin');
  if (!origin) return;

  try {
    const source = new URL(origin);
    const target = new URL(request.url);
    // Next can use the server's bind address in request.url (e.g. 0.0.0.0).
    // Host preserves the address used by the browser and by reverse proxies.
    const host = request.headers.get('host') || target.host;
    const destination = new URL(`${target.protocol}//${host}`);
    if (!['http:', 'https:'].includes(source.protocol) || source.origin !== origin) throw new Error();
    if (source.host === destination.host) return;
    if (development && loopbackHosts.has(source.hostname) && loopbackHosts.has(destination.hostname)
      && source.port === destination.port) return;
  } catch { /* Invalid origins are rejected along with foreign hosts. */ }

  throw new Error('This request must come from FootyGen.');
}
