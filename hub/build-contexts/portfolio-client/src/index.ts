(() => {
  type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
  type Dict = Record<string, Json>;

  interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  interface ChatResponse {
    text: string;
    model: string;
    latencyMs: number;
    promptTokens?: number;
    completionTokens?: number;
  }

  interface Job {
    id: string;
    appId: string;
    type: string;
    status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    input: Json;
    result?: Json;
    error?: string;
    events: Array<{ at: string; level: string; message: string; data?: Json }>;
  }

  interface Health {
    ok: boolean;
    service: string;
    version: string;
    ollama: { ok: boolean; url: string | null; models: string[]; error?: string };
    storage: { ok: boolean; root: string; jobs: number; records: number };
    capabilities: string[];
    authRequired: boolean;
  }

  interface RecordItem {
    id: string;
    appId: string;
    collection: string;
    createdAt: string;
    updatedAt: string;
    data: Json;
  }

  const meta = (name: string): string | null => document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? null;
  const appId = meta('portfolio-app-id') || (location.pathname.match(/^\/preview\/([^/]+)/) || [])[1] || 'portfolio';
  const base = (meta('portfolio-api-base') || '/api/backend').replace(/\/$/, '');
  let health: Health | null = null;

  async function request<T>(pathname: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has('content-type')) headers.set('content-type', 'application/json');
    const response = await fetch(`${base}${pathname}`, { ...init, headers, cache: 'no-store' });
    const text = await response.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    if (!response.ok) {
      const message = body && typeof body === 'object' && 'error' in body ? String((body as { error: unknown }).error) : text || response.statusText;
      throw new Error(message || `HTTP ${response.status}`);
    }
    return body as T;
  }

  const api = {
    appId,
    health: () => request<Health>('/health'),
    capabilities: () => request<{ capabilities: string[] }>('/api/capabilities'),
    chat: (messages: ChatMessage[], options: { model?: string; appId?: string } = {}) =>
      request<ChatResponse>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ messages, model: options.model, appId: options.appId || appId })
      }),
    createJob: (type: string, input: Json = {}, jobAppId = appId) =>
      request<{ job: Job }>('/api/jobs', { method: 'POST', body: JSON.stringify({ type, input, appId: jobAppId }) }).then((value) => value.job),
    getJob: (id: string) => request<{ job: Job }>(`/api/jobs/${encodeURIComponent(id)}`).then((value) => value.job),
    cancelJob: (id: string) => request<{ job: Job }>(`/api/jobs/${encodeURIComponent(id)}`, { method: 'DELETE' }).then((value) => value.job),
    listJobs: (limit = 20) => request<{ jobs: Job[] }>(`/api/jobs?limit=${limit}&appId=${encodeURIComponent(appId)}`).then((value) => value.jobs),
    watchJob: (id: string, onUpdate: (job: Job) => void): (() => void) => {
      const source = new EventSource(`${base}/api/jobs/${encodeURIComponent(id)}/events`);
      source.onmessage = (event) => {
        try {
          onUpdate(JSON.parse(event.data) as Job);
        } catch {
          return;
        }
      };
      source.onerror = () => source.close();
      return () => source.close();
    },
    listRecords: (collection = 'default') =>
      request<{ records: RecordItem[] }>(`/api/apps/${encodeURIComponent(appId)}/records?collection=${encodeURIComponent(collection)}`).then((value) => value.records),
    saveRecord: (data: Json, collection = 'default') =>
      request<{ record: RecordItem }>(`/api/apps/${encodeURIComponent(appId)}/records`, {
        method: 'POST',
        body: JSON.stringify({ data, collection })
      }).then((value) => value.record),
    deleteRecord: (id: string, collection = 'default') =>
      request<{ ok: boolean }>(`/api/apps/${encodeURIComponent(appId)}/records/${encodeURIComponent(id)}?collection=${encodeURIComponent(collection)}`, { method: 'DELETE' }),
    getState: () => request<{ state: { appId: string; updatedAt: string; data: Json } }>(`/api/apps/${encodeURIComponent(appId)}/state`).then((value) => value.state),
    setState: (data: Json) =>
      request<{ state: { appId: string; updatedAt: string; data: Json } }>(`/api/apps/${encodeURIComponent(appId)}/state`, {
        method: 'PUT',
        body: JSON.stringify({ data })
      }).then((value) => value.state)
  };

  Object.assign(window as unknown as { PortfolioBackend: typeof api; PortfolioAI: typeof api.chat }, {
    PortfolioBackend: api,
    PortfolioAI: api.chat
  });

  api.saveRecord({ event: 'app.open', route: location.pathname, title: document.title, at: new Date().toISOString() }, 'sessions').catch(() => undefined);

  const style = document.createElement('style');
  style.textContent = `
    :host{all:initial;font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif}
    .wrap{position:fixed;right:18px;bottom:18px;z-index:2147483647;color:#eef2ff}
    .toggle{display:flex;align-items:center;gap:8px;border:1px solid #334166;background:#111a31f2;color:#eef2ff;border-radius:999px;padding:9px 14px;font:600 12px/1 Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 10px 30px #0008}
    .dot{width:8px;height:8px;border-radius:50%;background:#f59e0b;box-shadow:0 0 8px currentColor}
    .dot.ok{background:#34d399}.dot.bad{background:#f87171}
    .panel{position:absolute;right:0;bottom:46px;width:min(420px,calc(100vw - 36px));max-height:min(620px,calc(100vh - 90px));overflow:hidden;border:1px solid #334166;border-radius:16px;background:#0b1020f7;box-shadow:0 24px 70px #000b;display:none;flex-direction:column}
    .panel.open{display:flex}
    .head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid #263252;font:700 13px/1.2 Inter,system-ui,sans-serif}
    .tabs{display:flex;gap:6px;padding:10px 12px 0}
    .tab{border:1px solid #2b385c;background:#111a31;color:#9eaccb;border-radius:8px;padding:6px 10px;font:600 11px/1 Inter,system-ui,sans-serif;cursor:pointer}
    .tab.active{color:#fff;border-color:#3f6bff;background:#20305e}
    .body{padding:12px 14px 14px;overflow:auto;font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;color:#c9d4f2}
    .row{display:flex;gap:8px;align-items:center;margin:6px 0}
    .pill{border:1px solid #2b385c;border-radius:999px;padding:2px 7px;font-size:10px;color:#9eaccb}
    pre,textarea,select{width:100%;box-sizing:border-box;background:#070c19;border:1px solid #2b385c;color:#dbe5ff;border-radius:9px;padding:9px;font:11px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace}
    textarea{resize:vertical;min-height:64px}
    pre{max-height:190px;overflow:auto;white-space:pre-wrap;word-break:break-word}
    button.primary{background:#2f5cff;border:0;color:#fff;border-radius:9px;padding:9px 12px;font:600 11px/1 Inter,system-ui,sans-serif;cursor:pointer}
    button.primary:disabled{opacity:.55;cursor:not-allowed}
    .muted{color:#8593b5;font-size:10px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .err{color:#fca5a5}.ok{color:#86efac}
  `;

  const host = document.createElement('div');
  host.id = 'portfolio-backend-widget';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.append(style);
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.innerHTML = `
    <div class="panel" data-panel>
      <div class="head"><span>Portfolio backend</span><span class="muted" data-app></span></div>
      <div class="tabs">
        <button class="tab active" data-tab="status">Status</button>
        <button class="tab" data-tab="ai">AI</button>
        <button class="tab" data-tab="jobs">Pipelines</button>
        <button class="tab" data-tab="data">Data</button>
      </div>
      <div class="body">
        <div data-view="status"></div>
        <div data-view="ai" hidden>
          <textarea data-ai-input placeholder="Ask the local model…"></textarea>
          <div class="row"><button class="primary" data-ai-send>Send</button><span class="muted" data-ai-meta></span></div>
          <pre data-ai-output></pre>
        </div>
        <div data-view="jobs" hidden>
          <div class="grid">
            <select data-job-type></select>
            <button class="primary" data-job-run>Run pipeline</button>
          </div>
          <textarea data-job-input>{}</textarea>
          <div class="muted" data-job-meta></div>
          <pre data-job-output></pre>
        </div>
        <div data-view="data" hidden>
          <div class="row"><button class="primary" data-state-load>Load state</button><button class="primary" data-state-save>Save state</button></div>
          <textarea data-state-input>{}</textarea>
          <pre data-records></pre>
        </div>
      </div>
    </div>
    <button class="toggle" data-toggle><span class="dot" data-dot></span><span data-label>Backend</span></button>
  `;
  shadow.append(wrap);
  document.documentElement.append(host);

  const q = <T extends Element>(selector: string): T => {
    const found = shadow.querySelector(selector);
    if (!found) throw new Error(`Missing widget element: ${selector}`);
    return found as T;
  };
  const panel = q<HTMLDivElement>('[data-panel]');
  const dot = q<HTMLSpanElement>('[data-dot]');
  const label = q<HTMLSpanElement>('[data-label]');
  q<HTMLSpanElement>('[data-app]').textContent = appId;
  q<HTMLButtonElement>('[data-toggle]').addEventListener('click', () => panel.classList.toggle('open'));

  const views = Array.from(shadow.querySelectorAll<HTMLElement>('[data-view]'));
  shadow.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      shadow.querySelectorAll('[data-tab]').forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      const name = tab.dataset.tab;
      views.forEach((view) => { view.hidden = view.dataset.view !== name; });
    });
  });

  const statusView = q<HTMLDivElement>('[data-view="status"]');
  const jobType = q<HTMLSelectElement>('[data-job-type]');

  function renderStatus(): void {
    if (!health) {
      statusView.innerHTML = '<div class="err">Backend unreachable.</div><div class="row"><button class="primary" data-retry>Retry</button></div>';
      statusView.querySelector('[data-retry]')?.addEventListener('click', () => void refresh());
      return;
    }
    const ollamaClass = health.ollama.ok ? 'ok' : 'err';
    statusView.innerHTML = `
      <div class="row"><span class="pill ${health.ok ? 'ok' : 'err'}">${health.ok ? 'online' : 'degraded'}</span><span class="muted">${health.service} v${health.version}</span></div>
      <div class="row"><span class="pill">app</span><span>${appId}</span></div>
      <div class="row"><span class="pill ${ollamaClass}">ollama</span><span>${health.ollama.ok ? (health.ollama.models.slice(0, 3).join(', ') || 'ready') : (health.ollama.error || 'offline')}</span></div>
      <div class="row"><span class="pill">storage</span><span>${health.storage.ok ? `${health.storage.jobs} jobs · ${health.storage.records} records` : 'unavailable'}</span></div>
      <div class="row"><span class="pill">api</span><span>${base}</span></div>
      <div class="muted">Pipelines: ${health.capabilities.join(', ')}</div>
    `;
  }

  async function refresh(): Promise<void> {
    dot.className = 'dot';
    try {
      health = await api.health();
      dot.classList.add(health.ok ? 'ok' : 'bad');
      label.textContent = health.ok ? 'Backend online' : 'Backend degraded';
      jobType.innerHTML = '';
      for (const capability of health.capabilities) {
        if (capability === 'ai.chat' || capability === 'ai.analyze' || capability === 'health.check') continue;
        jobType.add(new Option(capability, capability));
      }
      renderStatus();
      void loadJobs();
    } catch {
      health = null;
      dot.classList.add('bad');
      label.textContent = 'Backend offline';
      renderStatus();
    }
  }

  q<HTMLButtonElement>('[data-ai-send]').addEventListener('click', async () => {
    const input = q<HTMLTextAreaElement>('[data-ai-input]');
    const output = q<HTMLPreElement>('[data-ai-output]');
    const metaText = q<HTMLSpanElement>('[data-ai-meta]');
    const button = q<HTMLButtonElement>('[data-ai-send]');
    if (!input.value.trim()) return;
    button.disabled = true;
    output.textContent = 'Thinking…';
    metaText.textContent = '';
    try {
      const result = await api.chat([{ role: 'user', content: input.value }]);
      output.textContent = result.text;
      metaText.textContent = `${result.model} · ${result.latencyMs}ms`;
    } catch (error) {
      output.textContent = error instanceof Error ? error.message : String(error);
    } finally {
      button.disabled = false;
    }
  });

  q<HTMLButtonElement>('[data-job-run]').addEventListener('click', async () => {
    const output = q<HTMLPreElement>('[data-job-output]');
    const metaText = q<HTMLDivElement>('[data-job-meta]');
    const button = q<HTMLButtonElement>('[data-job-run]');
    const type = jobType.value;
    if (!type) {
      output.textContent = 'No pipeline selected.';
      return;
    }
    let input: Json = {};
    try {
      input = JSON.parse(q<HTMLTextAreaElement>('[data-job-input]').value || '{}') as Json;
    } catch {
      output.textContent = 'Input is not valid JSON.';
      return;
    }
    button.disabled = true;
    output.textContent = 'Queued…';
    metaText.textContent = '';
    try {
      const job = await api.createJob(type, input);
      output.textContent = `job ${job.id} ${job.status}`;
      const stop = api.watchJob(job.id, (current) => {
        output.textContent = JSON.stringify(current.result ?? current, null, 2);
        metaText.textContent = `${current.status} · ${current.events.length} events`;
        if (current.error) output.textContent = current.error;
        if (current.updatedAt) {
          button.disabled = current.status === 'queued' || current.status === 'running';
          if (current.status === 'succeeded' || current.status === 'failed' || current.status === 'cancelled') stop();
        }
      });
    } catch (error) {
      output.textContent = error instanceof Error ? error.message : String(error);
      button.disabled = false;
    }
  });

  async function loadJobs(): Promise<void> {
    const output = q<HTMLPreElement>('[data-job-output]');
    try {
      const jobs = await api.listJobs(6);
      output.textContent = jobs.length ? jobs.map((job) => `${job.status.padEnd(9)} ${job.type} ${job.id.slice(0, 8)}`).join('\n') : 'No jobs yet.';
    } catch {
      output.textContent = 'Job history unavailable.';
    }
  }

  q<HTMLButtonElement>('[data-state-load]').addEventListener('click', async () => {
    const input = q<HTMLTextAreaElement>('[data-state-input]');
    const records = q<HTMLPreElement>('[data-records]');
    try {
      input.value = JSON.stringify((await api.getState()).data, null, 2);
    } catch {
      input.value = '{}';
    }
    try {
      const list = await api.listRecords('sessions');
      records.textContent = list.length ? JSON.stringify(list.slice(-5), null, 2) : 'No sessions recorded.';
    } catch {
      records.textContent = 'Records unavailable.';
    }
  });

  q<HTMLButtonElement>('[data-state-save]').addEventListener('click', async () => {
    const records = q<HTMLPreElement>('[data-records]');
    try {
      const data = JSON.parse(q<HTMLTextAreaElement>('[data-state-input]').value || '{}') as Json;
      const state = await api.setState(data);
      records.textContent = `Saved at ${state.updatedAt}`;
    } catch (error) {
      records.textContent = error instanceof Error ? error.message : String(error);
    }
  });

  void refresh();
})();
