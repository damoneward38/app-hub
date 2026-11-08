const store = (globalThis.__virtualFS__ = globalThis.__virtualFS__ || {
  files: new Map()
});

function mkdirSync() {
  return true;
}

function existsSync(p) {
  return store.files.has(p) || (p.endsWith("/generated_images") && store.files.size > 0);
}

function writeFileSync(p, data) {
  const name = String(p).split("/").pop();
  store.files.set(name, typeof data === "string" ? data : String(data));
  return true;
}

module.exports = { mkdirSync, existsSync, writeFileSync, readdirSync: () => [...store.files.keys()] };