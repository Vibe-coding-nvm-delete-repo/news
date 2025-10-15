describe('Deployment configuration', () => {
  test('next.config.js uses static export', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nextConfig = require('../next.config.js');
    expect(nextConfig).toBeTruthy();
    expect(nextConfig.output).toBe('export');
  });

  test('vercel.json configures correct output directory', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const vercelConfig = require('../vercel.json');
    expect(vercelConfig).toBeTruthy();
    expect(vercelConfig.outputDirectory).toBe('out');
    expect(vercelConfig.buildCommand).toBe('npm run build');
    expect(vercelConfig.framework).toBe('nextjs');
  });
});
