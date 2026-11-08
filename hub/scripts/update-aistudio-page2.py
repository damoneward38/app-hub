import json, os, re, datetime
from pathlib import Path

hub = Path("/Users/davidyoung/app-containers-hub")
registry_path = hub / "public/apps.json"
d = json.loads(registry_path.read_text())
body = [x.strip() for x in Path("/tmp/aistudio-page2-body.txt").read_bytes().decode("utf-8", "replace").splitlines()]
links = json.loads(Path("/tmp/aistudio-links-page2.txt").read_bytes().decode("utf-8", "replace"))
icons = {"design_services","image","spark","music_note","bar_chart","code","search","apps","add","globe","keep","delete","widgets","gallery_thumbnail","folder","insert_drive_file","chevron_right","menu_open","speed","history","notifications","settings","key"}
start = body.index("Updated") + 1
cur, rows = [], []
for x in body[start:]:
    if x.startswith("Created "):
        vals = [z for z in cur if z and z not in icons and len(z) > 1 and not z.startswith(("Sep ","May ","Apr "))]
        if vals:
            rows.append((vals[0], vals[1] if len(vals) > 1 else "", x[8:]))
        cur = []
        continue
    cur.append(x)
assert len(rows) == 39 and len(links) == 39, (len(rows), len(links))
root = "/Users/davidyoung/GitHub-Pull/AISTUDIO-APPS"
localmap = {
    52:[f"{root}/12-buildmaster"], 53:[f"{root}/11-seter-phantom-sovereign"],
    54:[f"{root}/10-baraq"], 55:[f"{root}/09-magen-raki"],
    56:[f"{root}/08-zehav-the-golden-vault"], 57:[f"{root}/07-skyguard"],
    58:[f"{root}/06-global-hazard-hub"], 59:[f"{root}/02-phone-in-logs"],
    60:[f"{root}/04-optimus"], 61:[f"{root}/01-untitled", f"{root}/44-untitled"],
    62:[f"{root}/45-mockup-studio"], 85:[f"{root}/48-tzofeh"],
    88:[f"{root}/01-untitled", f"{root}/44-untitled"],
    89:[f"{root}/01-untitled", f"{root}/44-untitled"]
}
byord = {a.get("sourceOrdinal"):a for a in d["apps"] if isinstance(a.get("sourceOrdinal"), int)}
for i, ((name, desc, created), link) in enumerate(zip(rows, links), 51):
    a = byord[i]
    pid = link["href"].split("/apps/")[-1].split("?")[0]
    a.update({"name":name, "description":desc, "sourceProjectId":pid, "sourceUrl":link["href"], "sourcePageOrdinal":i, "createdLabel":created, "candidatePaths":localmap.get(i,[])})
    a.setdefault("evidence", {})
    a["evidence"].update({"pageListed":True, "localNameMatch":i in localmap, "exactProjectIdentityVerified":False})
    a.pop("duplicateOfSourceOrdinal", None)
    if i == 51:
        a["status"] = "SOURCE_LISTED_DUPLICATE_SOURCE_ID"
        a["duplicateOfSourceOrdinal"] = 50
        a["candidatePaths"] = [f"{root}/42-appforge-ai"]
        a["reason"] = "Exact AI Studio project ID duplicates page entry 50 (AppForge AI). Preserve this row because the page lists it, but it is the same source project ID; the local AppForge AI export remains an identity candidate."
    elif i in (61, 88, 89):
        a["status"] = "SOURCE_LISTED_AMBIGUOUS_NAME_MATCH"
        a["reason"] = "Three separate Untitled page entries but only two local Untitled folders; candidate paths are listed, and this exact project identity has not been established."
    elif i in localmap:
        a["status"] = "SOURCE_LISTED_LOCAL_NAME_MATCH"
        a["reason"] = "A local export folder has the same normalized project name. This is a candidate only; verify this exact AI Studio project ID against the local code before marking its export verified."
    else:
        a["status"] = "SOURCE_LISTED_NEEDS_EXPORT"
        a["reason"] = "Confirmed AI Studio project ID has no exact-name local export candidate. Export this exact project before conversion and container verification."

s = d["summary"]
s.update({
    "projectsDiscovered":len(d["apps"]), "googleAiStudioPageEntries":89,
    "googleAiStudioUniqueProjectIds":88, "googleAiStudioDuplicateSourceIdRows":1,
    "googleAiStudioLocalExportsFound":50, "googleAiStudioUniqueProjectsWithoutLocalExport":38,
    "googleAiStudioNotYetLocated":38, "googleAiStudioLocalNameMatches":11,
    "googleAiStudioAmbiguousNameMatches":3, "googleAiStudioEntriesWithoutLocalNameMatch":24,
    "googleAiStudioExactSourceExportsVerified":0, "sourceListedNeedsExport":24,
    "sourceListedLocalNameMatch":11, "sourceListedAmbiguousNameMatch":3,
    "sourceListedDuplicateSourceId":1
})
sc = s.setdefault("statusCounts", {})
for k in list(sc):
    if k.startswith("SOURCE_LISTED_"):
        sc.pop(k)
for k in ["SOURCE_LISTED_NEEDS_EXPORT","SOURCE_LISTED_LOCAL_NAME_MATCH","SOURCE_LISTED_AMBIGUOUS_NAME_MATCH","SOURCE_LISTED_DUPLICATE_SOURCE_ID"]:
    sc[k] = sum(a.get("status") == k for a in d["apps"])
d["generatedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
d["status"] = "89 AI Studio rows captured with 88 unique project IDs; 50 local export folders found; 38 unique project IDs still lack a verified local export"

p1 = json.loads(Path("/tmp/aistudio-links-page1.txt").read_bytes().decode("utf-8", "replace"))
def norm(s):
    return re.sub(r"[^a-z0-9]", "", re.sub(r"^\d+[-_ ]*", "", str(s).lower()))
page_entries = []
for i, x in enumerate(p1, 1):
    page_entries.append({"ordinal":i,"name":x["text"],"projectId":x["href"].split("/apps/")[-1].split("?")[0],"url":x["href"]})
for i, x in enumerate(links, 51):
    page_entries.append({"ordinal":i,"name":rows[i-51][0],"projectId":x["href"].split("/apps/")[-1].split("?")[0],"url":x["href"]})
for a in d["apps"]:
    if a.get("source") != "Google AI Studio" or not str(a.get("path","")).startswith(root):
        continue
    key = norm(os.path.basename(a["path"]))
    candidates = [z for z in page_entries if norm(z["name"]) == key]
    a["sourceNameMatches"] = [{"ordinal":z["ordinal"],"name":z["name"],"sourceProjectId":z["projectId"],"sourceUrl":z["url"]} for z in candidates]

registry_path.write_text(json.dumps(d, indent=2, ensure_ascii=False) + "\n")
rows_registry = sorted([a for a in d["apps"] if isinstance(a.get("sourceOrdinal"), int)], key=lambda z:z["sourceOrdinal"])
out = [
    "# Google AI Studio export queue: entries 51–89", "",
    "Source page: https://aistudio.google.com/apps?source=user&tag=created-by-you", "",
    "**Verified:** page footer reads `51–89 of 89`. This page contains 39 rows; project IDs reveal one repeated AppForge AI ID across rows 50 and 51, so there are 88 unique project IDs across 89 rows. Repeated/named entries remain recorded.", "",
    "| Row | Project | AI Studio project ID | Current local status |",
    "|---:|---|---|---|"
]
status_labels = {
    "SOURCE_LISTED_NEEDS_EXPORT":"No exact-name local candidate; export exact project",
    "SOURCE_LISTED_LOCAL_NAME_MATCH":"Same-name local candidate; verify identity",
    "SOURCE_LISTED_AMBIGUOUS_NAME_MATCH":"Ambiguous Untitled; verify which project",
    "SOURCE_LISTED_DUPLICATE_SOURCE_ID":"Same source ID as row 50; preserve duplicate row"
}
for a in rows_registry:
    out.append(f"| {a['sourceOrdinal']} | {a['name'].replace('|', r'\|')} | `{a['sourceProjectId']}` | {status_labels[a['status']]} |")
out += ["", "## Completion gate", "", "For each unique project ID: confirm source code identity; preserve the original export; record path/runtime; build an isolated container; run build and HTTP/health checks. Keep row duplicates in the inventory; do not claim a source export or build verified from a name match alone."]
(hub / "AISTUDIO-EXPORT-QUEUE.md").write_text("\n".join(out) + "\n")
print(json.dumps({"pageRows":89,"page2Rows":len(rows),"uniqueProjectIds":s["googleAiStudioUniqueProjectIds"],"duplicateSourceRows":s["googleAiStudioDuplicateSourceIdRows"],"localExportFolders":50,"uniqueProjectIdsWithoutLocalExport":s["googleAiStudioUniqueProjectsWithoutLocalExport"],"page2Statuses":{k:sc[k] for k in sc if k.startswith("SOURCE_LISTED_")}}, indent=2))
