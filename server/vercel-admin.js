import adminWorker from '../worker/index.js';

// Vercel Node functions bridge the Node request to the existing server-only auth.
export async function handleAdminRequest(req, res, action) {
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
    // Ignore browser-supplied Cloudflare headers on Vercel.
    headers.delete('cf-connecting-ip');
    const address = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
    headers.set('cf-connecting-ip', address);
    const protocol = process.env.VERCEL ? 'https' : 'http';
    const host = req.headers.host;
    if (!host || /[\s\\/]/.test(host)) {
      res.statusCode = 400;
      res.end('Invalid host');
      return;
    }
    let body;
    if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
      if (req.body !== undefined) {
        body = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? req.body : JSON.stringify(req.body);
      } else {
        const chunks = [];
        let bytes = 0;
        for await (const chunk of req) {
          bytes += Buffer.byteLength(chunk);
          if (bytes > 2048) {
            res.writeHead(413, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
            res.end(JSON.stringify({error:'요청 내용이 너무 큽니다.'}));
            return;
          }
          chunks.push(Buffer.from(chunk));
        }
        body = Buffer.concat(chunks);
      }
      if (Buffer.byteLength(body) > 2048) {
        res.writeHead(413, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
        res.end(JSON.stringify({error:'요청 내용이 너무 큽니다.'}));
        return;
      }
    }
    const request = new Request(`${protocol}://${host}/api/admin/${action}`, {method:req.method,headers,...(body === undefined ? {} : {body})});
    const response = await adminWorker.fetch(request, {
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
      ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
    });
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    if (!res.headersSent) res.writeHead(500, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
    res.end(JSON.stringify({error:'인증 요청을 처리하지 못했습니다.'}));
  }
}
