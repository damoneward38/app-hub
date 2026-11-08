import http from 'node:http';
import path from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import { createHandlers } from './handlers.js';
import { JobManager } from './jobs.js';
import { ollamaHealth } from './ollama.js';
import { PortfolioStore } from './store.js';
import type { Job, JsonValue, StoredRecord } from './types.js';

const PORT = Number(process.env.PORT || 4320);
const DATA_DIR = process.env.PORTFOLIO_DATA_DIR || path.resolve(process.cwd(), 'data');
const TOKEN = process.env.PORTFOLIO_API_TOKEN || '';
const ALLOWED_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;

const store = new PortfolioStore(DATA_DIR);
const handlers = createHandlers(store);
const jobs = new JobManager(store, handlers, Number(process.env.PORTFOLIO_JOB_CONCURRENCY || 2));

function corsHeaders(origin?: string): Record<string, string> {
  const allow = origin && ALLOWED_ORIGIN.test(origin) ? origin : '*';
  return {
    'access-control-allow-origin': allow,
    'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
    'access-control-max-age': '600',
    vary: 'origin'
  };
}

function json(res: http.ServerResponse, status: number, body: unknown, origin?: string): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...corsHeaders(origin)
  });
  res.end(payload);
}

function text(res: http.ServerResponse, status: number, body: string, origin?: string): void {
  res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8', ...corsHeaders(origin) });
  res.end(body);
}

function readBody(req: http.IncomingMessage, limit = 2 * 1024 * 1024): Promise<JsonValue> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (!chunks.length) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')) as JsonValue);
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function authorized(req: http.IncomingMessage): boolean {
  if (!TOKEN) return true;
  const header = req.headers.authorization || '';
  const supplied = header.startsWith('Bearer ') ? header.slice(7) : '';
  const a = Buffer.from(supplied);
  const b = Buffer.from(TOKEN);
  return a.length === b.length && timingSafeEqual(a, b);
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return '';
  }
}

function object(value: JsonValue | undefined): Record<string, JsonValue> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function string(value: JsonValue | undefined, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function publicJob(job: Job): Job {
  return job;
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(origin));
    return res.end();
  }
  let url: URL;
  try {
    url = new URL(req.url || '/', 'http://localhost');
  } catch {
    return text(res, 400, 'Bad request', origin);
  }
  const segments = url.pathname.split('/').filter(Boolean);
  try {
    if (url.pathname === '/health') {
      const [ollama, storage] = await Promise.all([ollamaHealth(), store.health()]);
      return json(res, ollama.ok && storage.ok ? 200 : 503, {
        ok: ollama.ok && storage.ok,
        service: 'portfolio-api',
        version: '1.0.0',
        ollama,
        storage,
        capabilities: jobs.capabilities(),
        authRequired: Boolean(TOKEN)
      }, origin);
    }
    if (url.pathname === '/api/capabilities') {
      return json(res, 200, {
        capabilities: jobs.capabilities(),
        notes: {
          persistence: 'file-backed JSON with atomic writes',
          ai: 'local Ollama only',
          auth: TOKEN ? 'bearer token required' : 'local access, no token'
        }
      }, origin);
    }
    if (!authorized(req)) return json(res, 401, { error: 'Unauthorized' }, origin);

    if (url.pathname === '/api/ai/chat') {
      if (req.method !== 'POST') return text(res, 405, 'Method not allowed', origin);
      const body = object(await readBody(req));
      const job = await jobs.create(string(body.appId, 'portfolio'), 'ai.chat', body as JsonValue);
      const finished = await waitForJob(job.id);
      if (!finished || finished.status === 'failed') return json(res, 502, { error: finished?.error || 'AI job failed', job: finished }, origin);
      return json(res, 200, finished.result ?? {}, origin);
    }

    if (url.pathname === '/api/jobs' && req.method === 'GET') {
      const limit = Number(url.searchParams.get('limit') || '50');
      const appId = url.searchParams.get('appId') || undefined;
      const list = await store.listJobs(limit, appId || undefined);
      return json(res, 200, { jobs: list.map(publicJob) }, origin);
    }

    if (url.pathname === '/api/jobs' && req.method === 'POST') {
      const body = object(await readBody(req));
      const appId = string(body.appId, 'portfolio');
      const type = string(body.type);
      if (!type) return json(res, 400, { error: 'type is required' }, origin);
      const job = await jobs.create(appId, type, (body.input ?? {}) as JsonValue);
      return json(res, 202, { job: publicJob(job) }, origin);
    }

    if (segments[0] === 'api' && segments[1] === 'jobs' && segments[2]) {
      const id = decode(segments[2]);
      if (segments[3] === 'events' && req.method === 'GET') {
        const job = await store.getJob(id);
        if (!job) return json(res, 404, { error: 'Job not found' }, origin);
        res.writeHead(200, {
          'content-type': 'text/event-stream',
          'cache-control': 'no-store',
          connection: 'keep-alive',
          'x-accel-buffering': 'no',
          ...corsHeaders(origin)
        });
        const sendEvent = (current: Job) => {
          res.write(`data: ${JSON.stringify(publicJob(current))}\n\n`);
        };
        sendEvent(job);
        if (job.finishedAt) return res.end();
        const unsubscribe = jobs.subscribe((current) => {
          if (current.id !== id) return;
          sendEvent(current);
          if (current.finishedAt) {
            unsubscribe();
            res.end();
          }
        });
        req.on('close', unsubscribe);
        return;
      }
      if (req.method === 'GET') {
        const job = await store.getJob(id);
        return job ? json(res, 200, { job: publicJob(job) }, origin) : json(res, 404, { error: 'Job not found' }, origin);
      }
      if (req.method === 'DELETE') {
        const job = await jobs.cancel(id);
        return job ? json(res, 200, { job: publicJob(job) }, origin) : json(res, 404, { error: 'Job not found' }, origin);
      }
      return text(res, 405, 'Method not allowed', origin);
    }

    if (segments[0] === 'api' && segments[1] === 'apps' && segments[2]) {
      const appId = decode(segments[2]);
      if (segments[3] === 'records') {
        const collection = url.searchParams.get('collection') || 'default';
        if (req.method === 'GET') {
          return json(res, 200, { records: await store.listRecords(appId, collection) }, origin);
        }
        if (req.method === 'POST') {
          const body = object(await readBody(req));
          const now = new Date().toISOString();
          const record: StoredRecord = {
            id: string(body.id) || `rec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
            appId,
            collection: string(body.collection, collection),
            createdAt: now,
            updatedAt: now,
            data: (body.data ?? {}) as JsonValue
          };
          return json(res, 201, { record: await store.putRecord(record) }, origin);
        }
        if (req.method === 'DELETE' && segments[4]) {
          const deleted = await store.deleteRecord(appId, collection, decode(segments[4]));
          return deleted ? json(res, 200, { ok: true }, origin) : json(res, 404, { error: 'Record not found' }, origin);
        }
        return text(res, 405, 'Method not allowed', origin);
      }
      if (segments[3] === 'state') {
        if (req.method === 'GET') {
          const state = await store.getState(appId);
          return state ? json(res, 200, { state }, origin) : json(res, 404, { error: 'State not found' }, origin);
        }
        if (req.method === 'PUT' || req.method === 'POST') {
          const body = await readBody(req);
          const data = object(body).data ?? body;
          return json(res, 200, { state: await store.putState(appId, data as JsonValue) }, origin);
        }
        return text(res, 405, 'Method not allowed', origin);
      }
    }

    return json(res, 404, { error: 'Not found' }, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = message.includes('too large') ? 413 : message.includes('Invalid JSON') ? 400 : 500;
    return json(res, status, { error: message }, origin);
  }
});

async function waitForJob(id: string, timeoutMs = 180_000): Promise<Job | undefined> {
  const started = Date.now();
  for (;;) {
    const job = await store.getJob(id);
    if (job?.finishedAt) return job;
    if (Date.now() - started > timeoutMs) return job;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
}

await store.init();
server.listen(PORT, '0.0.0.0', () => {
  console.log(`portfolio-api listening on ${PORT}; data=${DATA_DIR}; auth=${TOKEN ? 'bearer' : 'local'}; jobs=${jobs.capabilities().join(',')}`);
});
