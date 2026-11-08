import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 [SkyGuard CI/CD Test Pipeline] Starting automated verification...\n');

let passCount = 0;
let totalCount = 0;

function assertTest(name: string, fn: () => void | Promise<void>) {
  totalCount++;
  try {
    fn();
    console.log(`  ✅ [PASS] ${name}`);
    passCount++;
  } catch (err: any) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message || err);
  }
}

// 1. Verify index.html exists and is properly structured
assertTest('index.html exists at project root with proper <div id="root"></div>', () => {
  const content = fs.readFileSync('index.html', 'utf-8');
  if (!content.includes('id="root"')) throw new Error('Missing #root mount point in index.html');
  if (!content.includes('src="/src/main.tsx"')) throw new Error('Missing main.tsx entry in index.html');
});

// 2. Verify vite.config.ts has relative base path for GitHub Pages compatibility
assertTest('vite.config.ts configured with relative base path for GitHub Pages sub-path hosting', () => {
  const content = fs.readFileSync('vite.config.ts', 'utf-8');
  if (!content.includes('base:')) throw new Error('base path configuration recommended in vite.config.ts');
});

// 3. Verify TypeScript Typecheck & Linting
assertTest('TypeScript Compilation & Linting (tsc --noEmit)', () => {
  execSync('npm run lint', { stdio: 'pipe' });
});

// 4. Verify 6 Centers and Core Components exist
assertTest('All 6 Sovereign Cyber Centers and Pages are present', () => {
  const requiredFiles = [
    'src/pages/Dashboard.tsx',
    'src/pages/SecurityCenter.tsx',
    'src/pages/PrivacyCenter.tsx',
    'src/pages/ComplianceCenter.tsx',
    'src/pages/IdentityCenter.tsx',
    'src/pages/AutomationCenter.tsx',
    'src/pages/PlatformCenter.tsx',
    'src/pages/OperationsConsole.tsx',
    'src/pages/Workspaces.tsx',
    'src/pages/WhiteLabel.tsx',
    'src/pages/FeaturePage.tsx',
    'src/pages/Pricing.tsx',
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Missing required page file: ${file}`);
    }
  }
});

// 5. Verify Full-Stack Server APIs and Endpoints
assertTest('server.ts contains all required REST and SSE endpoints', () => {
  const serverCode = fs.readFileSync('server.ts', 'utf-8');
  const expectedEndpoints = [
    '/api/health',
    '/api/events',
    '/api/telemetry/stream',
    '/api/audit',
    '/api/whitelabel',
    '/api/e2e/simulate',
    '/api/performance/load-test',
    '/api/security/audit-scan',
    '/api/monitoring/status',
    '/api/docs/quickstart',
  ];

  for (const endpoint of expectedEndpoints) {
    if (!serverCode.includes(endpoint)) {
      throw new Error(`Missing server endpoint: ${endpoint}`);
    }
  }
});

// 6. Verify Production Build & Static Asset Generation
assertTest('Vite and esbuild production bundling builds dist/ correctly', () => {
  execSync('npm run build', { stdio: 'pipe' });
  if (!fs.existsSync('dist/index.html')) throw new Error('dist/index.html was not generated');
  if (!fs.existsSync('dist/server.cjs')) throw new Error('dist/server.cjs was not generated');
});

console.log(`\n========================================`);
console.log(`Pipeline Summary: ${passCount}/${totalCount} tests passed.`);
console.log(`========================================\n`);

if (passCount !== totalCount) {
  process.exit(1);
} else {
  console.log('🎉 All Pipeline & Repository Tests PASSED Successfully!');
  process.exit(0);
}
