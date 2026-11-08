#!/usr/bin/env python3
from __future__ import annotations
import json
import sys
import time
import urllib.request

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8780"


def get(path: str, timeout: int = 20):
    with urllib.request.urlopen(BASE + path, timeout=timeout) as response:
        return response.status, response.read()


def post(path: str, payload: dict, timeout: int = 30):
    request = urllib.request.Request(
        BASE + path,
        data=json.dumps(payload).encode(),
        headers={"content-type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        return response.status, json.loads(response.read())


def main() -> int:
    status, body = get("/api/backend/health")
    health = json.loads(body)
    if status != 200 or not health.get("ok"):
        print(f"FAIL backend health status={status} body={health}")
        return 1
    _, previews_body = get("/api/shared-previews")
    previews = json.loads(previews_body)["previews"]
    failures = []
    for preview in previews:
        try:
            _, html = get(preview["route"])
            text = html.decode("utf-8", "ignore")
            if "portfolio-client.js" not in text or 'name="portfolio-app-id"' not in text:
                failures.append(preview["id"])
        except Exception as error:
            failures.append(f"{preview['id']}:{error}")
    status, created = post("/api/backend/api/jobs", {
        "appId": "verification",
        "type": "document.stats",
        "input": {"text": "backend integration verification probe"},
    })
    job = created["job"]
    for _ in range(40):
        _, current_body = get(f"/api/backend/api/jobs/{job['id']}")
        current = json.loads(current_body)["job"]
        if current.get("finishedAt"):
            break
        time.sleep(0.25)
    ok_job = current.get("status") == "succeeded"
    print(json.dumps({
        "backend": health["service"],
        "ollama": health["ollama"]["ok"],
        "previewsChecked": len(previews),
        "previewsMissingInjection": failures,
        "job": {"id": job["id"], "status": current.get("status"), "result": current.get("result")},
    }, indent=2))
    return 0 if not failures and ok_job else 1


if __name__ == "__main__":
    raise SystemExit(main())
