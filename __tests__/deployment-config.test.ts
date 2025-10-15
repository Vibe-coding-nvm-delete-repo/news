describe('Deployment configuration', () => {
  test('next.config.js uses static export', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nextConfig = require('../next.config.js');
    expect(nextConfig).toBeTruthy();
    expect(nextConfig.output).toBe('export');
  });
});
