#!/usr/bin/env python3
"""Inventory every served portfolio app and classify backend/UI readiness."""
from __future__ import annotations

import json
import os
import re
import subprocess
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHARED = ROOT / "public" / "shared-static-previews.json"
APPS = ROOT / "public" / "apps.json"
OUT_JSON = ROOT / "reports" / "portfolio-app-inventory.json"
OUT_MD = ROOT / "reports" / "portfolio-app-inventory.md"
EXTS = {".ts", ".tsx", ".js", ".jsx", ".html", ".css", ".json", ".py", ".go", ".rs", ".vue", ".svelte"}
SKIP_DIRS = {"node_modules", "dist", "build", ".git", ".next", ".vite", "__pycache__", "coverage"}
PATTERNS = {
    "todo": re.compile(r"\b(TODO|FIXME|XXX)\b", re.I),
    "mock": re.compile(r"\b(mock|fake|dummy|canned|placeholder)\b", re.I),
    "simulate": re.compile(r"\bsimulat\w*", re.I),
    "not_implemented": re.compile(r"not implemented|coming soon|under construction|work in progress", re.I),
    "backend_call": re.compile(r"fetch\s*\(|axios\.|superagent|/api/|createServer\s*\(|express\s*\(|fastify\s*\(", re.I),
}


def read_text(path: Path, limit: int = 1_500_000) -> str:
    try:
        data = path.read_bytes()[:limit]
        return data.decode("utf-8", "ignore")
    except OSError:
        return ""


def walk_files(base: Path):
    if not base.exists():
        return
    for dirpath, dirnames, filenames in os.walk(base):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            p = Path(dirpath) / name
            if p.suffix.lower() in EXTS:
                yield p


def scan_path(base: Path):
    counts = Counter()
    samples = {k: [] for k in PATTERNS}
    source_files = 0
    ts_files = 0
    tsx_files = 0
    html_entry = (base / "index.html").exists()
    package_json = (base / "package.json").exists()
    tsconfig = (base / "tsconfig.json").exists()
    dockerfile = any((base / n).exists() for n in ("Dockerfile", "dockerfile", "docker-compose.yml", "compose.yaml"))
    server_files = []
    for p in walk_files(base):
        source_files += 1
        if p.suffix == ".ts":
            ts_files += 1
        elif p.suffix == ".tsx":
            tsx_files += 1
        rel = p.relative_to(base)
        if p.name.lower() in {"server.ts", "server.js", "app.ts", "index.ts", "main.py", "app.py"} or "server" in rel.parts:
            server_files.append(str(rel))
        text = read_text(p)
        for key, rx in PATTERNS.items():
            for m in rx.finditer(text):
                counts[key] += 1
                if len(samples[key]) < 3:
                    start = max(0, m.start() - 60)
                    samples[key].append({"file": str(rel), "excerpt": text[start:m.end() + 90].replace("\n", " ")[:220]})
    git_repo = subprocess.run(["git", "-C", str(base), "rev-parse", "--show-toplevel"], capture_output=True, text=True).returncode == 0
    return {
        "exists": base.exists(),
        "htmlEntry": html_entry,
        "packageJson": package_json,
        "tsconfig": tsconfig,
        "dockerConfig": dockerfile,
        "gitRepository": git_repo,
        "sourceFiles": source_files,
        "tsFiles": ts_files,
        "tsxFiles": tsx_files,
        "serverFiles": server_files[:8],
        "counts": dict(counts),
        "samples": samples,
    }


def main() -> int:
    shared = json.loads(SHARED.read_text())
    registry = json.loads(APPS.read_text())
    by_id = {a.get("id"): a for a in registry.get("apps", []) if a}
    apps = []
    for entry in shared:
        app = by_id.get(entry["id"], {})
        path = Path(app.get("path", ""))
        scan = scan_path(path) if path and path.exists() else {"exists": False, "counts": {}}
        counts = scan.get("counts", {})
        has_runtime = bool(scan.get("serverFiles")) or scan.get("dockerConfig")
        has_ts = bool(scan.get("tsFiles") or scan.get("tsxFiles"))
        readiness = "source+ts" if has_ts else "source-js" if scan.get("sourceFiles") else "static-only"
        apps.append({
            "id": entry["id"],
            "name": entry["name"],
            "route": entry["route"],
            "sourceType": entry.get("sourceType"),
            "path": str(path) if path else "",
            "platform": app.get("source", "Unknown"),
            "status": app.get("status", "Unknown"),
            "readiness": readiness,
            "hasRuntime": has_runtime,
            "riskScore": counts.get("todo", 0) * 3 + counts.get("mock", 0) * 2 + counts.get("simulate", 0) + counts.get("not_implemented", 0) * 2,
            **scan,
        })
    apps.sort(key=lambda a: (-a.get("riskScore", 0), a["name"].lower()))
    summary = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "totalServedApps": len(apps),
        "byReadiness": dict(Counter(a["readiness"] for a in apps)),
        "byPlatform": dict(Counter(a["platform"] for a in apps)),
        "withRuntime": sum(1 for a in apps if a.get("hasRuntime")),
        "withTodo": sum(1 for a in apps if a.get("counts", {}).get("todo", 0)),
        "withMockTerms": sum(1 for a in apps if a.get("counts", {}).get("mock", 0)),
        "withSimulationTerms": sum(1 for a in apps if a.get("counts", {}).get("simulate", 0)),
        "withNotImplemented": sum(1 for a in apps if a.get("counts", {}).get("not_implemented", 0)),
        "withBackendCalls": sum(1 for a in apps if a.get("counts", {}).get("backend_call", 0)),
    }
    OUT_JSON.write_text(json.dumps({"summary": summary, "apps": apps}, indent=2))
    lines = [
        "# Portfolio app inventory",
        "",
        f"Generated: {summary['generatedAt']}",
        "",
        "## Summary",
        "",
        f"- Served apps: **{summary['totalServedApps']}**",
        f"- Readiness: {summary['byReadiness']}",
        f"- Apps with runtime/server: **{summary['withRuntime']}**",
        f"- Apps with TODO/FIXME: **{summary['withTodo']}**",
        f"- Apps with mock/fake/placeholder terms: **{summary['withMockTerms']}**",
        f"- Apps with simulation terms: **{summary['withSimulationTerms']}**",
        f"- Apps with not-implemented/coming-soon text: **{summary['withNotImplemented']}**",
        f"- Apps already making backend/API calls: **{summary['withBackendCalls']}**",
        "",
        "## Highest-risk apps",
        "",
        "| Risk | App | Readiness | Runtime | TODO | Mock | Sim | Not impl. | Backend calls | Path |",
        "|---:|---|---|---|---:|---:|---:|---:|---:|---|",
    ]
    for a in apps[:60]:
        c = a.get("counts", {})
        lines.append(
            f"| {a['riskScore']} | {a['name']} | {a['readiness']} | {'yes' if a.get('hasRuntime') else 'no'} | "
            f"{c.get('todo',0)} | {c.get('mock',0)} | {c.get('simulate',0)} | {c.get('not_implemented',0)} | "
            f"{c.get('backend_call',0)} | `{a['path']}` |"
        )
    OUT_MD.write_text("\n".join(lines) + "\n")
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
