/**
 * Integration tests for large components
 * These tests verify components export correctly and basic structure
 */

describe('Large Components Export', () => {
  it('exports SettingsTab component', () => {
    const SettingsTab = require('@/components/SettingsTab').default;
    expect(SettingsTab).toBeDefined();
    expect(typeof SettingsTab).toBe('function');
  });

  it('exports NewsTab component', () => {
    const NewsTab = require('@/components/NewsTab').default;
    expect(NewsTab).toBeDefined();
    expect(typeof NewsTab).toBe('function');
  });

  it('exports PolicyViewer component', () => {
    const PolicyViewer = require('@/components/PolicyViewer').default;
    expect(PolicyViewer).toBeDefined();
    expect(typeof PolicyViewer).toBe('function');
  });

  it('exports Home page component', () => {
    const Home = require('@/app/page').default;
    expect(Home).toBeDefined();
    expect(typeof Home).toBe('function');
  });

  it('exports RootLayout component', () => {
    const RootLayout = require('@/app/layout').default;
    expect(RootLayout).toBeDefined();
    expect(typeof RootLayout).toBe('function');
  });

  it('exports layout metadata', () => {
    const { metadata } = require('@/app/layout');
    expect(metadata).toBeDefined();
    expect(metadata.title).toBe('News Report Generator');
    expect(metadata.description).toBe(
      'AI-powered news aggregation and analysis'
    );
  });
});
