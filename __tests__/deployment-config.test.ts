import fs from 'fs';
import path from 'path';

describe('Deployment configuration', () => {
  test('vercel.json sets outputDirectory to "out"', () => {
    const vercelPath = path.join(process.cwd(), 'vercel.json');
    expect(fs.existsSync(vercelPath)).toBe(true);
    const vercelRaw = fs.readFileSync(vercelPath, 'utf-8');
    const vercel = JSON.parse(vercelRaw);
    expect(vercel.outputDirectory).toBe('out');
  });

  test('next.config.js uses static export', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nextConfig = require('../next.config.js');
    expect(nextConfig).toBeTruthy();
    expect(nextConfig.output).toBe('export');
  });
});
