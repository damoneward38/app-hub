# Rork No-Backend App with Supabase — isolated web export

- Original source: `/Users/davidyoung/GitHub-Pull/RORK-APPS/rork-no-backend-app-with-supabase/expo`
- Rork project ID: `o1h6z3m1a7jqp6xyhn4ea` (also present in the source `package.json` scripts)
- Isolated build copy: `build-contexts/rork-no-backend-web`
- Output: `build-contexts/rork-no-backend-web/dist`
- Shared route: `http://localhost:8780/preview/rork-github-pull-rork-apps-rork-no-backend-app-with-supabase-expo/`
- Expo SDK 54 web export succeeded. `index.html`, JavaScript, and CSS asset requests returned HTTP 200 through the shared gateway.
- The source repo was not modified. The isolated copy sets Expo `experiments.baseUrl` for the shared route.
- Build compatibility workarounds were confined to the isolated copy: npm peer resolution used `--legacy-peer-deps` for React 19 vs `lucide-react-native` peer metadata; `zod@^4` was installed for the Rork toolkit's `zod/v4` import; and the Node-only dynamic-import helper in `@ai-sdk/provider-utils` was replaced in the temporary `node_modules` copy because Metro cannot parse `import(id)`. The helper is only used in the Node-runtime branch, not the browser branch.
- This is a verified static web preview, not proof that Rork AI/chat APIs, auth, audio recording, or mobile-native capabilities work end-to-end in the browser. Those require functional browser tests and appropriate service credentials.
