import fs from 'fs';
import path from 'path';

function parseVersion(v: string): [number, number, number] {
  const [maj, min, pat] = v.split('.').map(n => parseInt(n, 10));
  return [maj || 0, min || 0, pat || 0];
}

function gte(a: string, b: string): boolean {
  const [aM, aN, aP] = parseVersion(a);
  const [bM, bN, bP] = parseVersion(b);
  if (aM !== bM) return aM > bM;
  if (aN !== bN) return aN > bN;
  return aP >= bP;
}

describe('Security guard: Next.js version', () => {
  it('keeps Next at or above 14.2.33 to ensure patched vulnerabilities', () => {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const version = pkg.dependencies?.next;
    expect(version).toBeTruthy();
    // Strip potential range operators (e.g., ^ or ~) though we pin exact
    const normalized = (version || '').replace(/^[~^]/, '');
    expect(gte(normalized, '14.2.33')).toBe(true);
  });
});
