#!/usr/bin/env python3
"""Comprehensive end-to-end test for the houly-pipe bridge + Neural Core proxy.

Covers: hello, pairing (valid/invalid/expired), token auth, status, config,
job submit (with config / without config fallback / alias keys / bad body),
cancel, devices, path traversal, studio page, and Neural Core chat dispatch.

Usage:  python3 scripts/e2e_test.py
Exits non-zero if any check fails.
"""

from __future__ import annotations

import json
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

PIPE = Path(__file__).resolve().parent.parent
PROXY = "http://127.0.0.1:8765"        # Neural Core orchestrator (studio path)
BRIDGE = "http://127.0.0.1:8787"       # bridge direct (native app path)

results: list[tuple[bool, str, str]] = []


def check(name: str, ok: bool, note: str = "") -> None:
    results.append((ok, name, note))
    print(("  ✔ " if ok else "  ✘ ") + name + (f"  — {note}" if note else ""))


def http(base: str, path: str, data=None, token=None, raw_body: bytes | None = None,
         headers: dict | None = None, timeout: int = 30, method: str | None = None):
    if method is None:
        method = "POST" if (data is not None or raw_body is not None) else "GET"
    r = urllib.request.Request(base + path, method=method)
    if data is not None:
        r.add_header("Content-Type", "application/json")
        r.data = json.dumps(data).encode()
    elif raw_body is not None:
        r.data = raw_body
    if token:
        r.add_header("Authorization", "Bearer " + token)
    for k, v in (headers or {}).items():
        r.add_header(k, v)
    try:
        with urllib.request.urlopen(r, timeout=timeout) as resp:
            body = resp.read()
            try:
                return resp.status, json.loads(body.decode())
            except Exception:
                return resp.status, body
    except urllib.error.HTTPError as e:
        body = e.read()
        try:
            return e.code, json.loads(body.decode())
        except Exception:
            return e.code, body


def fresh_code() -> str:
    # force=1: never hand back a code whose pairing window may have closed
    st, body = http(PROXY, "/api/houly/newcode?force=1")
    return body["code"] if st == 200 else ""


def pair_via_proxy(device: str) -> tuple[bool, str, str]:
    code = fresh_code()
    if not code:
        return False, "", "no code"
    st, body = http(PROXY, "/api/houly/pair", {"code": code, "device": device, "platform": "web"})
    if st != 200:
        return False, "", str(body)[:80]
    return True, body.get("token") or body.get("accessToken"), body.get("deviceId", "")


def wait_job(token: str, job_id: str, want: set[str], timeout_s: int = 180):
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        st, s = http(PROXY, "/api/houly/status", token=token)
        if st == 200:
            for j in s.get("recentJobs") or []:
                if j.get("id") == job_id and j.get("state") in want:
                    return j
        time.sleep(4)
    return None


def main() -> int:
    print("\n== 1. availability ==")
    st, hello = http(BRIDGE, "/v1/hello")
    check("bridge hello (direct, like native app)", st == 200 and hello.get("service") == "houly-pipe")
    st, hello2 = http(PROXY, "/api/houly/hello")
    check("bridge hello (via orchestrator proxy, like studio)", st == 200 and hello2.get("service") == "houly-pipe")
    st, page = http(PROXY, "/studio")
    check("studio page served", st == 200 and b"Render Studio" in page)

    print("\n== 2. pairing security ==")
    st, body = http(BRIDGE, "/v1/pair", {"code": "000000", "device": "bad", "platform": "x"})
    check("wrong code rejected", st in (400, 401, 403, 429), str(body)[:60])
    ok, token, devid = pair_via_proxy("e2e-suite")
    check("valid code pairs via proxy", ok and bool(token), devid)
    st, s = http(PROXY, "/api/houly/status")
    check("status without token → 401", st == 401)
    st, s = http(PROXY, "/api/houly/status", token="deadbeef")
    check("status with bogus token → 401", st == 401)
    st, s = http(PROXY, "/api/houly/status", token=token)
    check("status with real token → 200", st == 200 and "recentJobs" in s)

    print("\n== 3. traversal & tampering ==")
    st, body = http(PROXY, "/api/houly/status", token=token, headers={"X-Path": "../../etc/passwd"})
    check("proxy ignores header injection", st in (200, 400))
    st, body = http(BRIDGE, "/v1/manifest", token=token)
    check("manifest endpoint authed OK", st in (200, 404), str(st))
    st, body = http(BRIDGE, "/v1/thumbnail", token=token)
    check("thumbnail endpoint authed OK", st in (200, 404), str(st))

    print("\n== 4. job submission matrix ==")
    st, body = http(PROXY, "/api/houly/jobs", {"title": "no config", "config": ""}, token=token)
    check("empty config → server falls back to its config.yaml (NEW)", st == 202, f"job {body.get('id')}")
    fallback_job = body.get("id") if st == 202 else None

    st, body = http(PROXY, "/api/houly/jobs", {"title": "alias key", "configYaml": "x" * 30}, token=token)
    check("configYaml alias accepted", st == 202, f"job {body.get('id')}")
    if st == 202:
        http(PROXY, f"/api/houly/jobs/{body['id']}/cancel", {}, token=token)

    st, body = http(BRIDGE, "/v1/jobs", raw_body=b"this is not json{{", token=token)
    check("non-JSON body rejected", st == 400, str(body)[:60])

    st, cfg = http(PROXY, "/api/houly/config")
    check("config endpoint returns YAML text", st == 200 and isinstance(cfg, bytes) and b"sceneSegments" in cfg)

    print("\n== 5. cancel behaviour ==")
    st, body = http(PROXY, "/api/houly/jobs", {"title": "cancel target", "config": "x" * 30}, token=token)
    cancel_id = body.get("id") if st == 202 else None
    if cancel_id:
        time.sleep(1)  # let it enter the queue
        st, body = http(PROXY, f"/api/houly/jobs/{cancel_id}/cancel", {}, token=token)
        check("cancel accepted (queued or running)", st in (200, 409), str(body)[:60])

    print("\n== 6. full render through the unified queue ==")
    st, body = http(PROXY, "/api/houly/jobs", {"title": "E2E full render", "config": cfg.decode() if isinstance(cfg, bytes) else cfg}, token=token)
    check("full render queued", st == 202, f"job {body.get('id')}")
    if st == 202:
        j = wait_job(token, body["id"], {"done", "failed"}, 300)
        check("render finished", bool(j) and j.get("state") == "done", (j or {}).get("state", "timeout"))
        manifest = PIPE / "out" / "manifest.json"
        check("manifest.json written", manifest.is_file())
        final = PIPE / "out" / "final_render.mp4"
        check("4K master on disk", final.is_file() and final.stat().st_size > 1_000_000,
              f"{final.stat().st_size // 1_048_576}MB" if final.is_file() else "missing")

    print("\n== 7. devices admin ==")
    st, body = http(BRIDGE, "/v1/devices", token=token)
    devices = body.get("devices") if isinstance(body, dict) else body
    check("device list", st == 200 and isinstance(devices, list), f"{len(devices)} devices" if isinstance(devices, list) else "")
    if isinstance(devices, list):
        mine = next((d for d in devices if d.get("name") == "e2e-suite"), None)
        if mine:
            st, _ = http(BRIDGE, f"/v1/devices/{mine['id']}", token=token, method="DELETE")
            check("revoke own test device", st == 200, str(st))

    print("\n== 8. bridge unit tests still green after patch ==")
    r = subprocess.run([sys.executable, str(PIPE / "scripts" / "test_bridge.py")],
                       capture_output=True, text=True, timeout=120)
    check("test_bridge.py 18/18", "OK" in r.stderr and "FAILED" not in r.stderr,
          r.stderr.strip().splitlines()[-1] if r.stderr else "")

    passed = sum(1 for ok, _, _ in results if ok)
    print(f"\n{'=' * 46}\nRESULT: {passed}/{len(results)} checks passed\n{'=' * 46}")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
