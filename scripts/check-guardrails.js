const fs = require('fs');
const path = require('path');

const ROOTS = ['src', 'app', 'modules'];
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.kt'];

const FORBIDDEN_CODE = [
  { pattern: /\bfetch\s*\(/, why: 'network call (fetch)' },
  { pattern: /XMLHttpRequest/, why: 'network call (XMLHttpRequest)' },
  { pattern: /\baxios\b/, why: 'network library (axios)' },
  { pattern: /\bWebSocket\b/, why: 'network call (WebSocket)' },
  { pattern: /READ_SMS|RECEIVE_SMS/, why: 'SMS permission' },
  { pattern: /NotificationListenerService/, why: 'reading other apps notifications' },
];

const FORBIDDEN_PACKAGES = [
  'firebase', '@react-native-firebase', 'sentry', '@sentry', 'amplitude',
  'mixpanel', 'segment', 'bugsnag', 'crashlytics', 'posthog', 'appsflyer',
];

const problems = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (EXTENSIONS.includes(path.extname(entry.name))) scan(full);
  }
}

function scan(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const rule of FORBIDDEN_CODE) {
      if (rule.pattern.test(line)) {
        problems.push(`${file}:${i + 1} ${rule.why}`);
      }
    }
  });
}

ROOTS.forEach(walk);

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
for (const dep of deps) {
  if (FORBIDDEN_PACKAGES.some((bad) => dep.toLowerCase().includes(bad))) {
    problems.push(`package.json forbidden package: ${dep}`);
  }
}

if (problems.length > 0) {
  console.error('Guardrail check failed:');
  problems.forEach((p) => console.error('  ' + p));
  process.exit(1);
}
console.log('Guardrail check passed.');