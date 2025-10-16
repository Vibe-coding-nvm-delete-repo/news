import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout, { metadata } from '@/app/layout';

// Mock the Inter font
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'mock-inter-font',
  }),
}));

describe('RootLayout', () => {
  it('renders children', () => {
    const { container } = render(
      <RootLayout>
        <div data-testid="test-child">Test Child</div>
      </RootLayout>
    );

    expect(
      container.querySelector('[data-testid="test-child"]')
    ).toBeInTheDocument();
  });

  it('renders html element with lang attribute', () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    const html = container.querySelector('html');
    expect(html).toHaveAttribute('lang', 'en');
  });

  it('applies Inter font className to body', () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    const body = container.querySelector('body');
    expect(body).toHaveClass('mock-inter-font');
  });

  it('renders complete document structure', () => {
    const { container } = render(
      <RootLayout>
        <div>Content</div>
      </RootLayout>
    );

    expect(container.querySelector('html')).toBeInTheDocument();
    expect(container.querySelector('body')).toBeInTheDocument();
  });
});

describe('Layout Metadata', () => {
  it('has correct title', () => {
    expect(metadata.title).toBe('NewsForge AI');
  });

  it('has correct description', () => {
    expect(metadata.description).toBe(
      'AI-powered news aggregation and intelligent reporting'
    );
  });
});
