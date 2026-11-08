#!/usr/bin/env python3
"""Audit served apps for mock, demo, and placeholder content."""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APPS = os.path.join(ROOT, 'public', 'apps.json')
REPORT = os.path.join(ROOT, 'reports', 'mock-placeholder-audit-2026-11-08.md')
SKIP_DIRS = {'node_modules', '.git', 'backups', 'build-contexts', '__pycache__', '.venv', 'dist-cache',
             'tests', 'test', '__tests__', '.next', 'coverage', 'fixtures', 'scripts'}
TEXT_EXT = {'.html', '.htm', '.js', '.mjs', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.css'}
MAX_BYTES = 2 * 1024 * 1024

PATTERNS = [
    ('ai_mock', re.compile(r'(?:\bmock\b|\bfake\b|\bdummy\b|\bcanned\b|simulat\w*)[^\n]{0,40}(?:ai|response|reply|answer|completion|generat)|(?:ai|response|reply|answer|completion)[^\n]{0,40}(?:\bmock\b|\bfake\b|\bdummy\b|\bcanned\b)', re.I)),
    ('fake_async', re.compile(r'setTimeout[^\n]{0,180}(?:aiResponse|mock|fake|dummy|canned|simulat)', re.I)),
    ('sample_data', re.compile(r'(?:sample|demo|mock|dummy|fake|test)\s+(?:data|dataset|content|records|users)', re.I)),
    ('coming_soon', re.compile(r'coming soon|not implemented|under construction|work in progress|\bstub\b', re.I)),
    ('lorem', re.compile(r'lorem ipsum', re.I)),
    ('placeholder_img', re.compile(r'(?:src|url)\s*[=(]\s*[\"\']?[^\"\'\n]*placeholder[^\"\'\n]*\.(?:png|svg|jpe?g|webp)|/placeholder[-_]', re.I)),
    ('placeholder_text', re.compile(r'>\s*(?:placeholder|sample|demo|coming soon|tbd|n/a)\s*<', re.I)),
]


def build_context(container):
    if not container:
        return ''
    base = os.path.join(ROOT, 'build-contexts')
    if not os.path.isdir(base):
        return ''
    slug = container.replace('app-', '').replace('preview-', '')
    for name in os.listdir(base):
        if slug and (slug in name or name in slug):
            return os.path.join(base, name)
    return ''


def served_artifacts():
    with open(APPS, encoding='utf-8') as handle:
        data = json.load(handle)
    apps = data.get('apps', data if isinstance(data, list) else [])
    result = []
    for app in apps:
        preview = app.get('preview') or {}
        if not preview.get('url'):
            continue
        path = preview.get('staticExportPath') or ''
        if not path:
            container = preview.get('container') or app.get('container')
            path = build_context(container) if preview.get('url', '').startswith('http') else (app.get('path') or '')
        if path and os.path.isdir(path):
            result.append((app, path))
    return result


def static_served_files(path):
    """Files actually reachable from a static export's entry HTML."""
    selected = set()
    html_files = []
    for name in os.listdir(path):
        if name.lower().endswith(('.html', '.htm')):
            full = os.path.join(path, name)
            html_files.append(full)
            selected.add(full)
    ref = re.compile(r'(?:src|href)\s*=\s*["\']([^"\'#?]+)')
    for html in html_files:
        try:
            with open(html, encoding='utf-8', errors='ignore') as handle:
                text = handle.read()
        except OSError:
            continue
        for match in ref.finditer(text):
            target = match.group(1)
            if target.startswith(('http:', 'https:', '//', 'data:', 'mailto:', '#')):
                continue
            full = os.path.normpath(os.path.join(os.path.dirname(html), target))
            if full.startswith(path) and os.path.isfile(full):
                selected.add(full)
    for folder in ('assets', 'static', 'js', 'css'):
        base = os.path.join(path, folder)
        if os.path.isdir(base):
            for name in os.listdir(base):
                full = os.path.join(base, name)
                if os.path.isfile(full):
                    selected.add(full)
    return selected


def scan_file(path):
    if os.path.getsize(path) > MAX_BYTES:
        return []
    try:
        with open(path, encoding='utf-8', errors='ignore') as handle:
            text = handle.read()
    except OSError:
        return []
    hits = []
    for name, pattern in PATTERNS:
        for match in pattern.finditer(text):
            line = text.count('\n', 0, match.start()) + 1
            snippet = text[max(0, match.start() - 40):match.end() + 40].replace('\n', ' ').strip()
            hits.append((name, line, snippet[:160]))
            if len(hits) > 400:
                return hits
    return hits


def main():
    artifacts = served_artifacts()
    apps = [app for app, _ in artifacts]
    rows = []
    totals = {}
    details = []
    for app, path in sorted(artifacts, key=lambda item: item[0].get('name', '').lower()):
        counts = {}
        samples = []
        is_source = os.path.join('build-contexts', '') in path + os.sep or path.endswith(os.sep + 'build-contexts')
        if is_source or not os.path.isfile(os.path.join(path, 'index.html')):
            files = []
            for base, dirs, names in os.walk(path):
                dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
                files.extend(os.path.join(base, name) for name in names)
        else:
            files = sorted(static_served_files(path))
        for full in files:
            if os.path.splitext(full)[1].lower() not in TEXT_EXT:
                continue
            for category, line, snippet in scan_file(full):
                counts[category] = counts.get(category, 0) + 1
                totals[category] = totals.get(category, 0) + 1
                if len(samples) < 12:
                    rel = os.path.relpath(full, path)
                    samples.append({'category': category, 'file': rel, 'line': line, 'snippet': snippet})
        if counts:
            rows.append({'name': app.get('name', app.get('id')), 'id': app.get('id'), 'source': app.get('source', ''), 'counts': counts})
            details.append({'name': app.get('name', app.get('id')), 'path': path, 'samples': samples})

    rows.sort(key=lambda r: -sum(r['counts'].values()))
    os.makedirs(os.path.dirname(REPORT), exist_ok=True)
    with open(REPORT, 'w', encoding='utf-8') as out:
        out.write('# Mock / Placeholder Audit — 2026-11-08\n\n')
        out.write(f'Served apps scanned: {len(apps)}\n\n')
        out.write('## Totals\n\n')
        for key, value in sorted(totals.items(), key=lambda item: -item[1]):
            out.write(f'- **{key}**: {value}\n')
        out.write('\n## Apps with hits\n\n')
        out.write('| App | Source | ' + ' | '.join(k for k, _ in PATTERNS) + ' | Total |\n')
        out.write('| --- | --- | ' + ' | '.join('---' for _ in PATTERNS) + ' | --- |\n')
        for row in rows:
            cells = [str(row['counts'].get(k, '')) for k, _ in PATTERNS]
            out.write(f"| {row['name']} | {row['source']} | " + ' | '.join(cells) + f" | {sum(row['counts'].values())} |\n")
        out.write('\n## Samples\n\n')
        for detail in details:
            out.write(f"### {detail['name']}\n\n")
            out.write(f"Path: `{detail['path']}`\n\n")
            for sample in detail['samples']:
                out.write(f"- `{sample['category']}` — `{sample['file']}:{sample['line']}` — {sample['snippet']}\n")
            out.write('\n')

    print(json.dumps({'apps_scanned': len(apps), 'apps_with_hits': len(rows), 'totals': totals, 'report': REPORT}, indent=2))
    for row in rows[:25]:
        print(f"{sum(row['counts'].values()):5d}  {row['name']}  {row['counts']}")


if __name__ == '__main__':
    main()
