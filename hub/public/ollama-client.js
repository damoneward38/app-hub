(function () {
  if (window.__ollamaClientLoaded) return;
  window.__ollamaClientLoaded = true;

  var DEFAULT_MODEL = 'llama3.2';
  var FALLBACK = 'llama3.2';

  function textOf(content) {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) return content.map(function (p) { return textOf(p && (p.text || p.content) || ''); }).join('');
    if (content && typeof content === 'object') return textOf(content.text || content.content || '');
    return '';
  }
  function normalize(messages) {
    if (typeof messages === 'string') return [{ role: 'user', content: messages }];
    if (!Array.isArray(messages)) return [];
    return messages.map(function (m) {
      return { role: m && m.role === 'assistant' ? 'assistant' : m && m.role === 'system' ? 'system' : 'user', content: textOf(m && m.content) };
    }).filter(function (m) { return m.content.length; });
  }
  function modelFromPath(pathname) {
    var m = pathname.match(/models\/([^/:]+):/);
    return m ? m[1] : '';
  }
  function mapExternal(abs) {
    var p = abs.pathname;
    if (/\/v1\/chat\/completions\/?$/.test(p)) return '/v1/chat/completions';
    if (/\/v1\/messages\/?$/.test(p)) return '/v1/messages';
    if (/:streamGenerateContent$/.test(p)) return '/api/ai/gemini/streamGenerateContent?alt=sse&model=' + encodeURIComponent(modelFromPath(p));
    if (/:generateContent$/.test(p)) return '/api/ai/gemini/generateContent?model=' + encodeURIComponent(modelFromPath(p));
    return null;
  }
  function isLocalHost(hostname) {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]';
  }

  if (!window.__ollamaNoIntercept) {
    var originalFetch = window.fetch ? window.fetch.bind(window) : null;
    if (originalFetch) {
      window.fetch = function (input, init) {
        try {
          var raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input && input.url;
          var abs = new URL(raw, location.href);
          if (abs.origin !== location.origin && !isLocalHost(abs.hostname)) {
            var mapped = mapExternal(abs);
            if (mapped) {
              var next = location.origin + mapped;
              input = typeof input === 'string' || input instanceof URL ? next : new Request(next, input);
            }
          }
        } catch (e) { /* leave request untouched */ }
        return originalFetch(input, init);
      };
    }
    var originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      try {
        var abs = new URL(url, location.href);
        if (abs.origin !== location.origin && !isLocalHost(abs.hostname)) {
          var mapped = mapExternal(abs);
          if (mapped) {
            var args = Array.prototype.slice.call(arguments);
            args[1] = location.origin + mapped;
            return originalOpen.apply(this, args);
          }
        }
      } catch (e) { /* leave request untouched */ }
      return originalOpen.apply(this, arguments);
    };
  }

  async function status() {
    var r = await fetch('/api/ai/status', { cache: 'no-store' });
    return r.json();
  }
  async function models() {
    var r = await fetch('/api/ai/models', { cache: 'no-store' });
    var data = await r.json();
    return data.models || [];
  }
  async function chat(messages, options) {
    var body = Object.assign({}, options || {}, { messages: normalize(messages), stream: false });
    var r = await fetch('/api/ai/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    var data = await r.json();
    if (!r.ok) throw new Error(data.error || ('HTTP ' + r.status));
    return data.message ? data.message.content : data;
  }
  async function stream(messages, onToken, options) {
    var body = Object.assign({}, options || {}, { messages: normalize(messages), stream: true });
    var r = await fetch('/api/ai/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok || !r.body) throw new Error('HTTP ' + r.status);
    var reader = r.body.getReader();
    var decoder = new TextDecoder();
    var buffer = '';
    var full = '';
    while (true) {
      var chunk = await reader.read();
      if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      var index;
      while ((index = buffer.indexOf('\n')) >= 0) {
        var line = buffer.slice(0, index).trim();
        buffer = buffer.slice(index + 1);
        if (!line) continue;
        try {
          var data = JSON.parse(line);
          var token = data.message && data.message.content;
          if (token) { full += token; if (onToken) onToken(token, full); }
        } catch (e) { /* partial line */ }
      }
    }
    return full;
  }

  window.OllamaAI = {
    defaultModel: DEFAULT_MODEL,
    status: status,
    models: models,
    chat: chat,
    stream: stream,
    normalize: normalize
  };

  var host = document.createElement('div');
  host.id = '__ollama_widget';
  var shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = [
    '<style>',
    ':host{all:initial}',
    '.launch{position:fixed;right:20px;bottom:20px;z-index:2147483647;border:1px solid #2f5cff;background:#2f5cff;color:#fff;border-radius:999px;padding:11px 16px;font:600 13px/1 Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 30px #0006}',
    '.panel{position:fixed;right:20px;bottom:76px;z-index:2147483647;width:min(390px,calc(100vw - 40px));height:min(520px,calc(100vh - 120px));display:flex;flex-direction:column;background:#0d1428;color:#e8eeff;border:1px solid #2b3a63;border-radius:16px;box-shadow:0 20px 60px #000a;font:13px/1.5 Inter,system-ui,sans-serif;overflow:hidden}',
    '.panel[hidden]{display:none}',
    'header{display:flex;align-items:center;gap:8px;padding:11px 12px;border-bottom:1px solid #21305a;background:#111a33}',
    'header b{font-size:13px;flex:1}',
    'select{background:#0a1020;color:#dbe6ff;border:1px solid #2b3a63;border-radius:8px;padding:4px 6px;font:12px inherit;max-width:150px}',
    'button.close{background:none;border:0;color:#8fa3cc;font-size:20px;cursor:pointer;line-height:1}',
    '#log{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:9px}',
    '.msg{padding:8px 11px;border-radius:11px;white-space:pre-wrap;overflow-wrap:anywhere;max-width:92%}',
    '.user{align-self:flex-end;background:#24406f;color:#fff}',
    '.assistant{align-self:flex-start;background:#16203a;border:1px solid #24335a}',
    'form{display:flex;gap:7px;padding:10px;border-top:1px solid #21305a;background:#0f1730}',
    'textarea{flex:1;resize:none;background:#0a1020;color:#e8eeff;border:1px solid #2b3a63;border-radius:10px;padding:9px 10px;font:13px/1.4 Inter,system-ui,sans-serif;max-height:100px}',
    'form button{background:#2f5cff;color:#fff;border:0;border-radius:10px;padding:0 14px;font:600 13px inherit;cursor:pointer}',
    'form button:disabled{opacity:.5;cursor:default}',
    '.foot{font-size:11px;color:#7f92b8;padding:0 12px 10px;background:#0f1730}',
    '</style>',
    '<button class="launch" id="launch" type="button">AI</button>',
    '<section class="panel" id="panel" hidden>',
    '<header><b>Local AI</b><select id="model"><option>llama3.2</option></select><button class="close" id="close" type="button" aria-label="Close">×</button></header>',
    '<div id="log"></div>',
    '<form id="form"><textarea id="input" rows="1" placeholder="Ask llama3.2…"></textarea><button id="send" type="submit">Send</button></form>',
    '<div class="foot" id="foot">Ollama · connecting…</div>',
    '</section>'
  ].join('');

  function boot() {
    document.body.appendChild(host);
    var launch = shadow.getElementById('launch');
    var panel = shadow.getElementById('panel');
    var close = shadow.getElementById('close');
    var form = shadow.getElementById('form');
    var input = shadow.getElementById('input');
    var send = shadow.getElementById('send');
    var log = shadow.getElementById('log');
    var modelSel = shadow.getElementById('model');
    var foot = shadow.getElementById('foot');
    var history = [];
    var busy = false;

    function refresh() {
      status().then(function (data) {
        modelSel.innerHTML = '';
        var names = data.models && data.models.length ? data.models : [data.defaultModel || DEFAULT_MODEL];
        names.forEach(function (name) { modelSel.add(new Option(name, name)); });
        var preferred = data.defaultModel && names.indexOf(data.defaultModel) >= 0 ? data.defaultModel : names[0];
        if (preferred) modelSel.value = preferred;
        foot.textContent = data.ok ? 'Ollama · ' + (data.endpoint || 'local') + ' · ' + names.length + ' models' : 'Ollama offline · start ollama serve';
        foot.style.color = data.ok ? '#7f92b8' : '#ff9a9a';
      }).catch(function () {
        foot.textContent = 'Ollama offline · start ollama serve';
        foot.style.color = '#ff9a9a';
      });
    }
    function add(role, text) {
      var el = document.createElement('div');
      el.className = 'msg ' + role;
      el.textContent = text;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
      return el;
    }
    function open() {
      panel.hidden = false;
      launch.style.display = 'none';
      refresh();
      input.focus();
    }
    function hide() {
      panel.hidden = true;
      launch.style.display = '';
    }
    launch.addEventListener('click', open);
    close.addEventListener('click', hide);
    input.addEventListener('input', function () {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
    });
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text || busy) return;
      input.value = '';
      input.style.height = 'auto';
      add('user', text);
      history.push({ role: 'user', content: text });
      var bubble = add('assistant', '…');
      var out = '';
      busy = true;
      send.disabled = true;
      try {
        out = await stream(history, function (_token, full) { bubble.textContent = full; log.scrollTop = log.scrollHeight; }, { model: modelSel.value || DEFAULT_MODEL });
        if (!out) bubble.textContent = '(empty response)';
        history.push({ role: 'assistant', content: out });
      } catch (error) {
        bubble.textContent = 'Error: ' + (error && error.message ? error.message : error);
        bubble.style.color = '#ffb4b4';
      } finally {
        busy = false;
        send.disabled = false;
        input.focus();
      }
    });
    refresh();
    setTimeout(refresh, 4000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
