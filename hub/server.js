import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, 'public');
const previewRoot = process.env.PREVIEW_ROOT || path.join(root, 'previews');
const port = Number(process.env.PORT || 8780);
const mime = {
  '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.mjs':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.gif':'image/gif',
  '.ico':'image/x-icon', '.woff':'font/woff', '.woff2':'font/woff2', '.ttf':'font/ttf', '.map':'application/json',
  '.wasm':'application/wasm', '.mp4':'video/mp4', '.webm':'video/webm', '.pdf':'application/pdf', '.txt':'text/plain; charset=utf-8'
};
let previewEntries = [];
try {
  previewEntries = JSON.parse(fs.readFileSync(path.join(publicDir, 'shared-static-previews.json'), 'utf8'));
} catch (error) {
  console.warn('Shared preview registry unavailable:', error.message);
}
const previewById = new Map(previewEntries.filter(e => /^[a-z0-9-]+$/.test(e.id)).map(e => [e.id, e]));

function send(res, status, type, body, extra = {}) {
  res.writeHead(status, { 'content-type': type, 'x-content-type-options':'nosniff', ...extra });
  res.end(body);
}
function safeDecode(value) {
  try { return decodeURIComponent(value); } catch { return null; }
}
function prefixRootPath(value, basePath) {
  if (value.startsWith('//')) return value;
  if (value === basePath || value.startsWith(basePath + '/')) return value;
  return basePath + value;
}
function rewriteRootAssets(html, basePath) {
  return html
    .replace(/(\b(?:src|href|action|poster|data-src)\s*=\s*["'])(\/(?!\/)[^"']*)/gi,
      (full, prefix, value) => prefix + prefixRootPath(value, basePath))
    .replace(/(url\(\s*["']?)(\/(?!\/)[^)"']*)/gi,
      (full, prefix, value) => prefix + prefixRootPath(value, basePath));
}
function handlePreview(req, res, url) {
  const parts = url.pathname.split('/');
  const id = safeDecode(parts[2] || '');
  const entry = id && previewById.get(id);
  if (!entry) return send(res, 404, 'text/plain; charset=utf-8', 'Preview not found');

  const remaining = parts.slice(3).join('/');
  const decoded = safeDecode(remaining || '');
  if (decoded === null || decoded.includes('\0') || decoded.split('/').some(p => p === '..' || p.startsWith('.'))) {
    return send(res, 400, 'text/plain; charset=utf-8', 'Invalid preview path');
  }
  const appRoot = path.resolve(previewRoot, id);
  let target = path.resolve(appRoot, decoded || 'index.html');
  if (target !== appRoot && !target.startsWith(appRoot + path.sep)) {
    return send(res, 400, 'text/plain; charset=utf-8', 'Invalid preview path');
  }

  fs.stat(target, (statError, stat) => {
    if (!statError && stat.isDirectory()) target = path.join(target, 'index.html');
    const fallbackAllowed = !path.extname(decoded || '');
    readSafePreviewFile(appRoot, target, fallbackAllowed, (status, safeTarget, body) => {
      if (status !== 200) return send(res, status, 'text/plain; charset=utf-8', status === 403 ? 'Preview path not allowed' : 'Preview file not found');
      return sendPreviewBody(res, req, safeTarget, body, entry.route.replace(/\/$/, ''));
    });
  });
}
function readSafePreviewFile(appRoot, candidate, fallbackAllowed, callback) {
  fs.realpath(appRoot, (rootError, realRoot) => {
    if (rootError) return callback(404);
    fs.realpath(candidate, (fileError, realTarget) => {
      if (fileError) {
        if (fallbackAllowed) return readSafePreviewFile(appRoot, path.join(appRoot, 'index.html'), false, callback);
        return callback(404);
      }
      if (realTarget !== realRoot && !realTarget.startsWith(realRoot + path.sep)) return callback(403);
      fs.readFile(realTarget, (readError, body) => readError ? callback(404) : callback(200, realTarget, body));
    });
  });
}
function sendPreviewBody(res, req, target, body, basePath) {
  const ext = path.extname(target).toLowerCase();
  const headers = { 'cache-control': ext === '.html' ? 'no-store' : 'public, max-age=300' };
  if (ext === '.html') body = Buffer.from(rewriteRootAssets(body.toString('utf8'), basePath));
  if (ext === '.css') body = Buffer.from(body.toString('utf8').replace(/(url\(\s*[\"']?)\/(?!\/)/gi, `$1${basePath}/`).replace(/(?<![A-Za-z0-9_-])\/assets\//g, `${basePath}/assets/`));
  if (ext === '.js' || ext === '.mjs') body = Buffer.from(body.toString('utf8').replace(/(?<![A-Za-z0-9_-])\/(assets|_expo)\//g, (full, folder) => `${basePath}/${folder}/`));
  if (req.method === 'HEAD') {
    res.writeHead(200, { 'content-type':mime[ext] || 'application/octet-stream', 'x-content-type-options':'nosniff', ...headers });
    return res.end();
  }
  res.writeHead(200, { 'content-type':mime[ext] || 'application/octet-stream', 'x-content-type-options':'nosniff', ...headers });
  res.end(body);
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'text/plain; charset=utf-8', 'Method not allowed', { allow:'GET, HEAD' });
  let url;
  try { url = new URL(req.url || '/', 'http://localhost'); }
  catch { return send(res, 400, 'text/plain; charset=utf-8', 'Bad request'); }

  if (url.pathname === '/health') {
    return send(res, 200, 'application/json; charset=utf-8', JSON.stringify({ ok:true, service:'app-containers-portal', sharedStaticPreviews:previewById.size }), { 'cache-control':'no-store' });
  }
  if (url.pathname === '/api/apps') {
    return fs.readFile(path.join(publicDir, 'apps.json'), (error, body) => {
      if (error) return send(res, 500, 'application/json; charset=utf-8', JSON.stringify({ error:'App registry unavailable' }));
      return send(res, 200, 'application/json; charset=utf-8', body, { 'cache-control':'no-store' });
    });
  }
  if (url.pathname === '/api/shared-previews') {
    return send(res, 200, 'application/json; charset=utf-8', JSON.stringify({ count:previewById.size, previews:previewEntries.map(({id,name,route}) => ({id,name,route})) }), { 'cache-control':'no-store' });
  }
  if (url.pathname === '/preview' || url.pathname.startsWith('/preview/')) return handlePreview(req, res, url);

  const requested = url.pathname === '/' ? '/index.html' : safeDecode(url.pathname);
  if (requested === null) return send(res, 400, 'text/plain; charset=utf-8', 'Bad request');
  const target = path.resolve(publicDir, '.' + requested);
  if (!target.startsWith(publicDir + path.sep)) return send(res, 400, 'text/plain; charset=utf-8', 'Bad request');
  fs.readFile(target, (error, body) => {
    if (error) return send(res, 404, 'text/plain; charset=utf-8', 'Not found');
    return send(res, 200, mime[path.extname(target).toLowerCase()] || 'application/octet-stream', body);
  });
});
server.listen(port, '0.0.0.0', () => console.log(`App portal listening on ${port}; shared static previews=${previewById.size}`));
