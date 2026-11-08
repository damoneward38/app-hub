import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, 'public');
const previewRoot = process.env.PREVIEW_ROOT || path.join(root, 'previews');
const port = Number(process.env.PORT || 8780);
const PORTFOLIO_API_URL = (process.env.PORTFOLIO_API_URL || 'http://host.docker.internal:19113').replace(/\/$/, '');
const PORTFOLIO_API_TOKEN = process.env.PORTFOLIO_API_TOKEN || '';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const OLLAMA_CANDIDATES = (process.env.OLLAMA_URLS || process.env.OLLAMA_URL ||
  'http://host.docker.internal:11434,http://127.0.0.1:11434')
  .split(',').map(s => s.trim()).filter(Boolean).map(s => s.replace(/\/$/, ''));
const AI_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 120000);
let activeOllama = null;
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

// ----------------------------------------------------
// Local AI bridge (Ollama)
// ----------------------------------------------------
function aiHeaders(extra = {}) {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization,x-api-key,anthropic-version,anthropic-dangerous-direct-browser-access',
    'cache-control': 'no-store',
    ...extra
  };
}
function jsonError(res, status, message) {
  return send(res, status, 'application/json; charset=utf-8', JSON.stringify({ error: String(message || 'AI bridge error') }), aiHeaders());
}
function readJsonBody(req, limit = 4 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > limit) { reject(new Error('Request body too large')); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}
async function ollama(pathname, payload, timeoutMs = AI_TIMEOUT_MS) {
  const bases = activeOllama
    ? [activeOllama, ...OLLAMA_CANDIDATES.filter(base => base !== activeOllama)]
    : OLLAMA_CANDIDATES;
  let lastError;
  for (const base of bases) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(base + pathname, {
        method: payload === undefined ? 'GET' : 'POST',
        headers: payload === undefined ? {} : { 'content-type': 'application/json' },
        body: payload === undefined ? undefined : JSON.stringify(payload),
        signal: controller.signal
      });
      if (response.ok || response.status < 500) { activeOllama = base; return response; }
      lastError = new Error(`Ollama HTTP ${response.status} at ${base}`);
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timer);
    }
  }
  activeOllama = null;
  throw lastError || new Error('Ollama is not reachable');
}
async function localModelNames() {
  const response = await ollama('/api/tags', undefined, 5000);
  const data = await response.json();
  return (data.models || []).map(model => model.name);
}
async function resolveModel(requested) {
  let names = [];
  try { names = await localModelNames(); } catch { /* fall back below */ }
  const wanted = typeof requested === 'string' ? requested.trim() : '';
  if (wanted) {
    if (names.includes(wanted)) return wanted;
    if (names.includes(wanted + ':latest')) return wanted + ':latest';
  }
  if (DEFAULT_MODEL && (names.includes(DEFAULT_MODEL) || !names.length)) return DEFAULT_MODEL;
  return names.find(name => name.startsWith('llama3.2')) || names[0] || DEFAULT_MODEL;
}
function normalizeMessages(list) {
  if (!Array.isArray(list)) return [];
  return list.map(message => {
    const role = message?.role === 'assistant' ? 'assistant' : message?.role === 'system' ? 'system' : 'user';
    let content = message?.content;
    if (Array.isArray(content)) {
      content = content.map(part => typeof part === 'string' ? part : part?.text || part?.content || '').join('');
    }
    if (typeof content !== 'string') content = content == null ? '' : JSON.stringify(content);
    return { role, content };
  }).filter(message => message.content.length);
}
function ollamaOptions(body) {
  const options = {};
  if (typeof body.temperature === 'number') options.temperature = body.temperature;
  if (typeof body.top_p === 'number') options.top_p = body.top_p;
  if (typeof body.max_tokens === 'number') options.num_predict = body.max_tokens;
  if (typeof body.max_output_tokens === 'number') options.num_predict = body.max_output_tokens;
  return options;
}
async function runChat(body, messages, stream) {
  const options = ollamaOptions(body);
  const payload = { model: await resolveModel(body.model), messages, stream: !!stream };
  if (Object.keys(options).length) payload.options = options;
  const response = await ollama('/api/chat', payload);
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Ollama ${response.status}: ${detail.slice(0, 400)}`);
  }
  return { response, model: payload.model };
}

async function handleAiStatus(res) {
  try {
    const names = await localModelNames();
    return send(res, 200, 'application/json; charset=utf-8', JSON.stringify({
      ok: true, endpoint: activeOllama, defaultModel: await resolveModel(DEFAULT_MODEL), models: names
    }), aiHeaders());
  } catch (error) {
    return send(res, 200, 'application/json; charset=utf-8', JSON.stringify({
      ok: false, endpoint: activeOllama, defaultModel: DEFAULT_MODEL, models: [], error: String(error.message || error)
    }), aiHeaders());
  }
}
async function handleAiChat(req, res) {
  let body;
  try { body = await readJsonBody(req); } catch (error) { return jsonError(res, 400, error.message); }
  const messages = normalizeMessages(body.messages);
  if (!messages.length) return jsonError(res, 400, 'messages[] is required');
  try {
    const { response, model } = await runChat(body, messages, body.stream !== false);
    if (body.stream !== false) {
      res.writeHead(200, aiHeaders({ 'content-type': 'application/x-ndjson' }));
      for await (const chunk of response.body) res.write(chunk);
      return res.end();
    }
    const data = await response.json();
    return send(res, 200, 'application/json; charset=utf-8', JSON.stringify({ ok: true, model, message: data.message, done: true }), aiHeaders());
  } catch (error) {
    return jsonError(res, 502, error.message);
  }
}
async function handleOpenAiModels(res) {
  try {
    const names = await localModelNames();
    return send(res, 200, 'application/json; charset=utf-8', JSON.stringify({
      object: 'list',
      data: names.map(id => ({ id, object: 'model', created: 0, owned_by: 'local-ollama' }))
    }), aiHeaders());
  } catch (error) {
    return jsonError(res, 502, error.message);
  }
}
async function handleOpenAiChat(req, res) {
  let body;
  try { body = await readJsonBody(req); } catch (error) { return jsonError(res, 400, error.message); }
  const messages = normalizeMessages(body.messages);
  if (!messages.length) return jsonError(res, 400, 'messages[] is required');
  try {
    const { response, model } = await runChat(body, messages, false);
    const data = await response.json();
    const text = data.message?.content || '';
    const created = Math.floor(Date.now() / 1000);
    if (!body.stream) {
      return send(res, 200, 'application/json; charset=utf-8', JSON.stringify({
        id: 'chatcmpl-local', object: 'chat.completion', created, model,
        choices: [{ index: 0, message: { role: 'assistant', content: text }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
      }), aiHeaders());
    }
    res.writeHead(200, aiHeaders({ 'content-type': 'text/event-stream', 'connection': 'keep-alive', 'x-accel-buffering': 'no' }));
    const base = { id: 'chatcmpl-local', object: 'chat.completion.chunk', created, model };
    res.write(`data: ${JSON.stringify({ ...base, choices: [{ index: 0, delta: { role: 'assistant' }, finish_reason: null }] })}\n\n`);
    res.write(`data: ${JSON.stringify({ ...base, choices: [{ index: 0, delta: { content: text }, finish_reason: null }] })}\n\n`);
    res.write(`data: ${JSON.stringify({ ...base, choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] })}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
  } catch (error) {
    return jsonError(res, 502, error.message);
  }
}
async function handleAnthropic(req, res) {
  let body;
  try { body = await readJsonBody(req); } catch (error) { return jsonError(res, 400, error.message); }
  const messages = normalizeMessages(body.messages);
  const system = typeof body.system === 'string' ? body.system
    : Array.isArray(body.system) ? body.system.map(part => part?.text || '').join('\n') : '';
  if (system) messages.unshift({ role: 'system', content: system });
  if (!messages.length) return jsonError(res, 400, 'messages[] is required');
  try {
    const { response, model } = await runChat(body, messages, false);
    const data = await response.json();
    const text = data.message?.content || '';
    if (!body.stream) {
      return send(res, 200, 'application/json; charset=utf-8', JSON.stringify({
        id: 'msg_local', type: 'message', role: 'assistant', model,
        content: [{ type: 'text', text }],
        stop_reason: 'end_turn', stop_sequence: null,
        usage: { input_tokens: 0, output_tokens: 0 }
      }), aiHeaders());
    }
    res.writeHead(200, aiHeaders({ 'content-type': 'text/event-stream', 'connection': 'keep-alive', 'x-accel-buffering': 'no' }));
    const event = (name, data) => res.write(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`);
    event('message_start', { type: 'message_start', message: { id: 'msg_local', type: 'message', role: 'assistant', model, content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 0, output_tokens: 0 } } });
    event('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } });
    event('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text } });
    event('content_block_stop', { type: 'content_block_stop', index: 0 });
    event('message_delta', { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 0 } });
    event('message_stop', { type: 'message_stop' });
    return res.end();
  } catch (error) {
    return jsonError(res, 502, error.message);
  }
}
async function handleGemini(req, res, url) {
  let body;
  try { body = await readJsonBody(req); } catch (error) { return jsonError(res, 400, error.message); }
  const messages = [];
  const system = body.systemInstruction?.parts?.map(part => part.text || '').join('\n');
  if (system) messages.push({ role: 'system', content: system });
  for (const content of body.contents || []) {
    const text = (content.parts || []).map(part => part.text || '').join('');
    if (text) messages.push({ role: content.role === 'model' ? 'assistant' : 'user', content: text });
  }
  if (!messages.length) return jsonError(res, 400, 'contents[] is required');
  const requested = decodeURIComponent((url.pathname.match(/\/(?:models\/)?([^/:]+):/) || [])[1] || '');
  try {
    const { response, model } = await runChat({ ...body, model: requested || body.model }, messages, false);
    const data = await response.json();
    const text = data.message?.content || '';
    const payload = {
      candidates: [{ content: { role: 'model', parts: [{ text }] }, finishReason: 'STOP', index: 0 }],
      usageMetadata: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
      modelVersion: model
    };
    const wantsSse = url.searchParams.get('alt') === 'sse';
    const isStream = url.pathname.endsWith(':streamGenerateContent');
    if (wantsSse) {
      res.writeHead(200, aiHeaders({ 'content-type': 'text/event-stream', 'connection': 'keep-alive', 'x-accel-buffering': 'no' }));
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
      return res.end();
    }
    return send(res, 200, 'application/json; charset=utf-8', JSON.stringify(isStream ? [payload] : payload), aiHeaders());
  } catch (error) {
    return jsonError(res, 502, error.message);
  }
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
      return sendPreviewBody(res, req, safeTarget, body, entry.route.replace(/\/$/, ''), id);
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
function sendPreviewBody(res, req, target, body, basePath, appId) {
  const ext = path.extname(target).toLowerCase();
  const headers = { 'cache-control': ext === '.html' ? 'no-store' : 'public, max-age=300' };
  if (ext === '.html') {
    let html = rewriteRootAssets(body.toString('utf8'), basePath);
    if (!html.includes('/ollama-client.js')) {
      const tag = '<script src="/ollama-client.js" defer></script>';
      html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, tag + '</body>') : html + tag;
    }
    if (!html.includes('/portfolio-client.js')) {
      const meta = `<meta name="portfolio-app-id" content="${appId}"><meta name="portfolio-api-base" content="/api/backend">`;
      html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + meta) : meta + html;
      const tag = '<script src="/portfolio-client.js" defer></script>';
      html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, tag + '</body>') : html + tag;
    }
    body = Buffer.from(html);
  }
  if (ext === '.css') body = Buffer.from(body.toString('utf8').replace(/(url\(\s*[\"']?)\/(?!\/)/gi, `$1${basePath}/`).replace(/(?<![A-Za-z0-9_-])\/assets\//g, `${basePath}/assets/`));
  if (ext === '.js' || ext === '.mjs') body = Buffer.from(body.toString('utf8').replace(/(?<![A-Za-z0-9_-])\/(assets|_expo)\//g, (full, folder) => `${basePath}/${folder}/`));
  if (req.method === 'HEAD') {
    res.writeHead(200, { 'content-type':mime[ext] || 'application/octet-stream', 'x-content-type-options':'nosniff', ...headers });
    return res.end();
  }
  res.writeHead(200, { 'content-type':mime[ext] || 'application/octet-stream', 'x-content-type-options':'nosniff', ...headers });
  res.end(body);
}

async function proxyPortfolioApi(req, res, url) {
  const suffix = url.pathname.replace(/^\/api\/backend/, '') || '/';
  const target = new URL(suffix + url.search, PORTFOLIO_API_URL + '/');
  if (!['http:', 'https:'].includes(target.protocol)) return send(res, 502, 'application/json; charset=utf-8', JSON.stringify({ error: 'Invalid backend target' }));
  const headers = { ...req.headers, host: target.host };
  if (PORTFOLIO_API_TOKEN && !headers.authorization) headers.authorization = `Bearer ${PORTFOLIO_API_TOKEN}`;
  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req,
      duplex: 'half'
    });
    const responseHeaders = {};
    upstream.headers.forEach((value, key) => {
      if (!['content-encoding', 'content-length', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) responseHeaders[key] = value;
    });
    res.writeHead(upstream.status, responseHeaders);
    if (!upstream.body) return res.end();
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (error) {
    return send(res, 502, 'application/json; charset=utf-8', JSON.stringify({ error: `Backend unavailable: ${error.message}` }));
  }
}

const server = http.createServer(async (req, res) => {
  let url;
  try { url = new URL(req.url || '/', 'http://localhost'); }
  catch { return send(res, 400, 'text/plain; charset=utf-8', 'Bad request'); }

  const isAiPost = req.method === 'POST' && (
    url.pathname === '/api/ai/chat' ||
    url.pathname === '/v1/chat/completions' ||
    url.pathname === '/v1/messages' ||
    url.pathname.startsWith('/api/ai/gemini/') ||
    url.pathname.includes(':generateContent') ||
    url.pathname.includes(':streamGenerateContent')
  );
  if (req.method === 'OPTIONS') { res.writeHead(204, aiHeaders()); return res.end(); }
  if (url.pathname === '/api/backend' || url.pathname.startsWith('/api/backend/')) {
    return proxyPortfolioApi(req, res, url);
  }
  if (req.method !== 'GET' && req.method !== 'HEAD' && !isAiPost) {
    return send(res, 405, 'text/plain; charset=utf-8', 'Method not allowed', { allow:'GET, HEAD, POST' });
  }

  if (url.pathname === '/health') {
    return send(res, 200, 'application/json; charset=utf-8', JSON.stringify({
      ok: true, service: 'app-containers-portal', sharedStaticPreviews: previewById.size,
      ai: { endpoint: activeOllama || OLLAMA_CANDIDATES[0], defaultModel: DEFAULT_MODEL }
    }), { 'cache-control':'no-store' });
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

  // Local AI
  if (url.pathname === '/api/ai/status' || url.pathname === '/api/ai/models') return handleAiStatus(res);
  if (url.pathname === '/api/ai/chat' && req.method === 'POST') return handleAiChat(req, res);
  if (url.pathname === '/v1/models' && req.method === 'GET') return handleOpenAiModels(res);
  if (url.pathname === '/v1/chat/completions' && req.method === 'POST') return handleOpenAiChat(req, res);
  if (url.pathname === '/v1/messages' && req.method === 'POST') return handleAnthropic(req, res);
  if (url.pathname.includes(':generateContent') || url.pathname.includes(':streamGenerateContent')) {
    if (req.method === 'POST') return handleGemini(req, res, url);
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
server.listen(port, '0.0.0.0', () => console.log(`App portal listening on ${port}; shared static previews=${previewById.size}; ollama=${activeOllama || OLLAMA_CANDIDATES[0]} model=${DEFAULT_MODEL}`));
