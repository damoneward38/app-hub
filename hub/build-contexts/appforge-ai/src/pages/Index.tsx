import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Hammer, Copy, Check, Sparkles, Code2, Eye, RefreshCw } from 'lucide-react';

const presets = [
  { name: 'Event Log', type: 'list', feats: ['search', 'add', 'filters'], please: 'Attach a timestamp and severity to each log event.' },
  { name: 'Squad Board', type: 'monitor', feats: ['stats', 'add', 'export'], please: 'Track agent status per theater.' },
  { name: 'Intake Desk', type: 'form', feats: ['add', 'export', 'dark'], please: 'Collect service requests and list them back.' },
];

const featOptions = [
  { id: 'search', label: 'Search' },
  { id: 'add', label: 'Add entry' },
  { id: 'stats', label: 'Stats cards' },
  { id: 'filters', label: 'Filters' },
  { id: 'export', label: 'Export' },
  { id: 'dark', label: 'Dark theme' },
];

const typeOptions = [
  { value: 'dashboard', label: 'Dashboard / ops' },
  { value: 'list', label: 'Data list / log' },
  { value: 'form', label: 'Form / entry tool' },
  { value: 'monitor', label: 'Monitor / status board' },
  { value: 'terminal', label: 'Terminal / console' },
];

export default function Index() {
  const [name, setName] = useState('Harbor Watch');
  const [type, setType] = useState('dashboard');
  const [feats, setFeats] = useState<string[]>(['search', 'add', 'filters']);
  const [purpose, setPurpose] = useState('');
  const [html, setHtml] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleFeat = (id: string) => {
    setFeats(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const applyPreset = (i: number) => {
    const p = presets[i];
    setName(p.name);
    setType(p.type);
    setFeats(p.feats);
    setPurpose(p.please);
  };

  const escape = (s: string) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c] || c);

  const buildDoc = (appName: string, appType: string, features: string[], hint: string) => {
    const F = { search: features.includes('search'), add: features.includes('add'), stats: features.includes('stats'), filters: features.includes('filters'), export: features.includes('export'), dark: features.includes('dark') };
    const typeLabel = ({ dashboard: 'Dashboard', list: 'Data list / log', form: 'Form tool', monitor: 'Monitor / status board', terminal: 'Terminal / console' } as Record<string, string>)[appType] || 'App';
    const bodyCss = F.dark ? 'background:#0a0e15;color:#e7eef8' : 'background:#f5f7fb;color:#0d1520';
    const cardBg = F.dark ? '#11161f' : '#ffffff';
    const cardBd = F.dark ? '#222c3a' : '#e3e8f0';
    const inputBg = F.dark ? '#0b1018' : '#ffffff';
    const accent = ({ dashboard: 'border-top:4px solid #4da3ff', list: 'border-left:4px solid #f5a623', form: 'border-left:4px solid #a78bfa', monitor: 'border-top:4px solid #2ecc71', terminal: 'border-left:4px solid #22c1c3' } as Record<string, string>)[appType];
    const seedT = F.add ? "const ITEMS=[{t:'Seed entry — tune it',d:0},{t:'Wire actions below',d:1}];\n" : "const ITEMS=[{t:'Seed entry — tune it',s:'info'}];\n";
    const script = seedT + [
      "const ListEl=document.getElementById('list');",
      "function paint(f){const rows=ITEMS.filter(function(it){return !f||(f==='done'&&it.d)||(f==='open'&&!it.d)}).map(function(it){return '<li><span>'+it.t.replace(/[<>&]/g,'')+'</span><b>'+((it.d?'done':'open'))+'</b></li>'});ListEl.innerHTML=rows.join('')||'<li class=\"dim\">Nothing matches.</li>';}",
      "const q=document.getElementById('q');if(q)q.addEventListener('input',function(e){const v=e.target.value.toLowerCase();ListEl.innerHTML=ITEMS.filter(function(it){return it.t.toLowerCase().indexOf(v)>-1}).map(function(it){return '<li><span>'+it.t+'</span><b>'+((it.d?'done':'open'))+'</b></li>'}).join('')});",
      "const b=document.getElementById('addBtn');const di=document.getElementById('new');if(b&&di)b.addEventListener('click',function(){const v=di.value.trim();if(!v)return;ITEMS.push({t:v,d:0});di.value='';paint()});",
      "document.querySelectorAll('[data-fl]').forEach(function(x){x.addEventListener('click',function(){paint(x.getAttribute('data-fl'))})});",
      "paint()"
    ].join('\n');
    const searchHtml = F.search ? '<div class="row"><input id="q" placeholder="Filter ' + escape(appName) + '…"></div>' : '';
    const addHtml = F.add ? '<div class="row"><input id="new" placeholder="Add a ' + escape(appType) + ' entry…"><button id="addBtn">+ Add</button></div>' : '';
    const filtHtml = F.filters ? '<div class="row"><button class="ghost" data-fl="all">All</button><button class="ghost" data-fl="done">Done</button><button class="ghost" data-fl="open">Open</button></div>' : '';
    const statHtml = F.stats ? '<div class="stats"><div class="stat"><b id="s1">0</b><span class="dim">items</span></div><div class="stat"><b>12</b><span class="dim">active</span></div><div class="stat"><b>100%</b><span class="dim">health</span></div></div>' : '';
    return '<!doctype html><html><head><meta charset="utf-8">' +
      '<title>' + escape(appName) + '</title><style>' +
      ':root{color-scheme:' + (F.dark ? 'dark' : 'light') + '}*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,sans-serif;' + bodyCss + ';padding:22px}' +
      'h1{font-size:19px;margin:0}.header{display:flex;align-items:center;gap:10px;margin-bottom:18px}.sub{color:#7c8ba0;font-size:12px}' +
      '.card{background:' + cardBg + ';border:1px solid ' + cardBd + ';border-radius:12px;padding:14px 16px;margin-bottom:12px;' + accent + '}' +
      '.row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}input{flex:1;min-width:160px;padding:10px 12px;border:1px solid #dbe1ea;border-radius:9px;font-size:13px;background:' + inputBg + ';color:inherit}' +
      'button{padding:9px 16px;border:none;border-radius:9px;background:#4da3ff;color:#ffffff;font-weight:700;font-size:13px;cursor:pointer}button.ghost{background:transparent;border:1px solid ' + (F.dark ? '#31415a' : '#dbe1ea') + ';color:#7c8ba0}' +
      '.list{padding:0;margin:0;list-style:none}.list li{padding:9px 4px;border-bottom:1px solid ' + (F.dark ? '#202a38' : '#eceff5') + ';font-size:13px;display:flex;justify-content:space-between}' +
      '.list li b{font-size:10px;padding:2px 8px;border-radius:10px;background:#e9f2ff;color:#2b6fce}' +
      '.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:12px}.stat{background:' + cardBg + ';border:1px solid ' + cardBd + ';border-radius:11px;padding:11px 13px}.stat b{display:block;font-size:19px}' +
      '.dim{color:#7c8ba0}.note{color:#8a99ad;font-size:12px;margin-top:2px}.pill{background:#e9f2ff;color:#2b6fce;border-radius:13px;padding:3px 10px;font-size:11px;margin-left:auto}</style></head><body>' +
      '<div class="header"><h1>⚒ ' + escape(appName) + '</h1><span class="sub">' + typeLabel + ' · ' + new Date().toISOString().slice(0, 10) + '</span><span class="pill">forged</span></div>' +
      '<div class="card">' + statHtml + searchHtml + addHtml + filtHtml + '<ul class="list" id="list"></ul>' +
      '<div class="note">' + escape(hint || 'A focused single-purpose tool — tune the seed rows, then ship it.') + '</div></div>' +
      '<script>\n' + script + '\n<' + '/script>' +
      '</body></html>';
  };

  const highlight = (src: string) => {
    let out = escape(src);
    out = out.replace(/(<!--[\s\S]*?-->)/g, '<span class="tk-c">$1</span>');
    out = out.replace(/("[^"]*")/g, '<span class="tk-s">$1</span>');
    out = out.replace(/\b(const|let|var|function|return|if|else|for|document|window|addEventListener)\b/g, '<span class="tk-k">$1</span>');
    out = out.replace(/\b(ITEMS|ListEl|paint)\b/g, '<span class="tk-t">$1</span>');
    out = out.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tk-n">$1</span>');
    return out;
  };

  const forge = () => {
    const doc = buildDoc(name, type, feats, purpose);
    setHtml(doc);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { forge(); setLoading(false); }, 420);
  };

  const copyCode = () => {
    const text = html.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center gap-3 p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-primary-foreground font-bold">⚒</div>
        <div>
          <h1 className="text-lg font-bold">AppForge AI</h1>
          <p className="text-xs text-muted-foreground">Prompt-to-app generator · forge · preview · ship</p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
          FORGING INTERNALLY
        </Badge>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hammer className="w-5 h-5" />
                  New app brief
                </CardTitle>
                <CardDescription>Configure your app below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="appName">App name</Label>
                  <Input id="appName" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Harbor Watch" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appType">App type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Features</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {featOptions.map(feat => (
                      <div key={feat.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={feat.id}
                          checked={feats.includes(feat.id)}
                          onCheckedChange={() => toggleFeat(feat.id)}
                        />
                        <Label htmlFor={feat.id} className="text-sm font-normal cursor-pointer">{feat.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose hint (optional)</Label>
                  <Textarea id="purpose" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="One line on what the app should actually do…" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Hammer className="w-4 h-4 mr-2" />}
                  ⚒ Forge app
                </Button>
              </CardContent>
            </Card>

            {/* Right: Preview & Code */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Live preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-4 h-[400px] overflow-auto">
                    {html ? (
                      <iframe
                        srcDoc={html}
                        className="w-full h-full border-0"
                        title="Preview"
                        sandbox="allow-scripts allow-same-origin"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Click "Forge app" to generate preview</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="w-5 h-5" />
                    Generated code
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Badge variant="outline">{html ? (html.length / 1024).toFixed(1) + ' KB' : '—'}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={copyCode}
                      disabled={!html}
                      className="ml-auto"
                    >
                      {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-muted rounded-lg p-4 h-[400px] overflow-auto text-xs font-mono">
                    {html ? highlight(html) : <span className="text-muted-foreground">// Generated code will appear here</span>}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>

        {/* Presets */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Quick presets
          </h3>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, i) => (
              <Button key={i} variant="outline" size="sm" onClick={() => applyPreset(i)}>
                {p.name}
              </Button>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border p-4 text-center text-sm text-muted-foreground mt-8">
        AppForge AI · single-file generator · vanilla JS, no dependencies, no network
      </footer>
    </div>
  );
}
