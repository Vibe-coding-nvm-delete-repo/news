import React from 'react';
import '@testing-library/jest-dom';
import RootLayout, { metadata } from '@/app/layout';

describe('RootLayout', () => {
  describe('Metadata', () => {
    it('should have correct title', () => {
      expect(metadata.title).toBe('News Report Generator');
    });

    it('should have correct description', () => {
      expect(metadata.description).toBe(
        'AI-powered news aggregation and analysis'
      );
    });

    it('should export metadata object', () => {
      expect(metadata).toBeDefined();
      expect(typeof metadata).toBe('object');
    });

    it('should have both title and description properties', () => {
      expect(metadata).toHaveProperty('title');
      expect(metadata).toHaveProperty('description');
    });
  });

  describe('Layout Structure', () => {
    it('should render html element with lang attribute', () => {
      const testChild = <div>Test Child</div>;
      const layout = RootLayout({ children: testChild });

      expect(layout).toBeDefined();
      expect(layout.type).toBe('html');
      expect(layout.props.lang).toBe('en');
    });

    it('should have correct component structure', () => {
      const testChild = <div data-testid="test-child">Test Content</div>;
      const layout = RootLayout({ children: testChild });

      expect(layout).toBeDefined();
      expect(layout.type).toBe('html');
      expect(layout.props.lang).toBe('en');
    });

    it('should render children prop', () => {
      const testChild = <div>Test Child Content</div>;
      const layout = RootLayout({ children: testChild });

      expect(layout.props.children).toBeDefined();
    });

    it('should have body element in structure', () => {
      const testChild = <div>Test</div>;
      const layout = RootLayout({ children: testChild });

      // Check that body is in the children
      expect(layout.props.children.type).toBe('body');
    });

    it('should pass children to body element', () => {
      const testChild = <div>Test Child</div>;
      const layout = RootLayout({ children: testChild });

      const bodyElement = layout.props.children;
      expect(bodyElement.props.children).toEqual(testChild);
    });

    it('should apply className to body element', () => {
      const testChild = <div>Test</div>;
      const layout = RootLayout({ children: testChild });

      const bodyElement = layout.props.children;
      expect(bodyElement.props.className).toBeDefined();
      expect(typeof bodyElement.props.className).toBe('string');
      expect(bodyElement.props.className.length).toBeGreaterThan(0);
    });
  });

  describe('Children Rendering', () => {
    it('should render single child component', () => {
      const child = <div data-testid="single-child">Single Child</div>;
      const layout = RootLayout({ children: child });

      const bodyElement = layout.props.children;
      expect(bodyElement.props.children).toEqual(child);
    });

    it('should render multiple child components', () => {
      const children = (
        <>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </>
      );
      const layout = RootLayout({ children });

      const bodyElement = layout.props.children;
      expect(bodyElement.props.children).toEqual(children);
    });

    it('should render complex nested children', () => {
      const children = (
        <div data-testid="parent">
          <div data-testid="nested-child">
            <span data-testid="deeply-nested">Deep</span>
          </div>
        </div>
      );
      const layout = RootLayout({ children });

      const bodyElement = layout.props.children;
      expect(bodyElement.props.children).toEqual(children);
    });

    it('should handle React fragments as children', () => {
      const children = (
        <>
          <div>Fragment Child 1</div>
          <div>Fragment Child 2</div>
        </>
      );
      const layout = RootLayout({ children });

      const bodyElement = layout.props.children;
      expect(bodyElement.props.children).toEqual(children);
    });

    it('should render text nodes', () => {
      const children = 'Plain text content';
      const layout = RootLayout({ children });

      const bodyElement = layout.props.children;
      expect(bodyElement.props.children).toEqual(children);
    });
  });

  describe('HTML Structure Validation', () => {
    it('should have proper html > body hierarchy', () => {
      const testChild = <div>Test</div>;
      const layout = RootLayout({ children: testChild });

      expect(layout.type).toBe('html');
      expect(layout.props.children.type).toBe('body');
    });

    it('should return html element as root', () => {
      const testChild = <div>Test</div>;
      const layout = RootLayout({ children: testChild });

      expect(layout.type).toBe('html');
    });

    it('should have body as direct child of html', () => {
      const testChild = <div>Test</div>;
      const layout = RootLayout({ children: testChild });

      const bodyElement = layout.props.children;
      expect(bodyElement.type).toBe('body');
    });

    it('should structure children inside body', () => {
      const testChild = <div>Test Content</div>;
      const layout = RootLayout({ children: testChild });

      const bodyElement = layout.props.children;
      expect(bodyElement.props.children).toBe(testChild);
    });
  });

  describe('Props Handling', () => {
    it('should accept children prop', () => {
      const TestChild = () => <div>Test Component</div>;
      const children = <TestChild />;
      const layout = RootLayout({ children });

      const bodyElement = layout.props.children;
      expect(bodyElement.props.children).toEqual(children);
    });

    it('should handle readonly children prop', () => {
      // TypeScript enforces Readonly<{ children: React.ReactNode }>
      const children: Readonly<React.ReactNode> = <div>Readonly Child</div>;
      const layout = RootLayout({ children });

      const bodyElement = layout.props.children;
      expect(bodyElement.props.children).toEqual(children);
    });

    it('should accept function as props parameter', () => {
      const children = <div>Test</div>;
      const result = RootLayout({ children });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('Accessibility', () => {
    it('should have lang attribute for screen readers', () => {
      const testChild = <div>Test</div>;
      const layout = RootLayout({ children: testChild });

      expect(layout.props.lang).toBe('en');
    });

    it('should use semantic HTML5 elements', () => {
      const children = <main>Main Content</main>;
      const layout = RootLayout({ children });

      expect(layout.type).toBe('html');
      expect(layout.props.children.type).toBe('body');
    });

    it('should support assistive technologies with lang attribute', () => {
      const layout = RootLayout({ children: <div>Content</div> });

      expect(layout.props).toHaveProperty('lang');
      expect(layout.props.lang).toBe('en');
    });
  });

  describe('Font Configuration', () => {
    it('should apply font className from Inter font', () => {
      const testChild = <div>Test</div>;
      const layout = RootLayout({ children: testChild });

      const bodyElement = layout.props.children;
      // Inter font from next/font/google generates a className
      expect(bodyElement.props.className).toBeTruthy();
      expect(bodyElement.props.className.length).toBeGreaterThan(0);
    });

    it('should have className property on body element', () => {
      const layout = RootLayout({ children: <div>Test</div> });
      const bodyElement = layout.props.children;

      expect(bodyElement.props).toHaveProperty('className');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children gracefully', () => {
      const layout = RootLayout({ children: null });

      expect(layout.type).toBe('html');
      expect(layout.props.children.type).toBe('body');
    });

    it('should handle undefined children gracefully', () => {
      const layout = RootLayout({ children: undefined });

      expect(layout.type).toBe('html');
      expect(layout.props.children.type).toBe('body');
    });

    it('should handle empty string children', () => {
      const layout = RootLayout({ children: '' });

      expect(layout.type).toBe('html');
      expect(layout.props.children.type).toBe('body');
      expect(layout.props.children.props.children).toBe('');
    });

    it('should handle boolean children (should not render)', () => {
      const layout1 = RootLayout({ children: true as any });
      const layout2 = RootLayout({ children: false as any });

      expect(layout1.type).toBe('html');
      expect(layout2.type).toBe('html');
    });

    it('should handle arrays of children', () => {
      const children = [
        <div key="1" data-testid="array-child-1">
          Child 1
        </div>,
        <div key="2" data-testid="array-child-2">
          Child 2
        </div>,
        <div key="3" data-testid="array-child-3">
          Child 3
        </div>,
      ];
      const layout = RootLayout({ children });

      const bodyElement = layout.props.children;
      expect(bodyElement.props.children).toEqual(children);
    });

    it('should handle number children', () => {
      const layout = RootLayout({ children: 42 as any });

      expect(layout.type).toBe('html');
      expect(layout.props.children.props.children).toBe(42);
    });
  });

  describe('Integration', () => {
    it('should work with real page content', () => {
      const children = (
        <main>
          <h1>Test Page</h1>
          <p>Page content</p>
          <button>Click me</button>
        </main>
      );
      const layout = RootLayout({ children });

      expect(layout.type).toBe('html');
      const bodyElement = layout.props.children;
      expect(bodyElement.props.children).toEqual(children);
    });

    it('should maintain proper document structure with complex content', () => {
      const children = (
        <div>
          <header>Header</header>
          <main>
            <article>Article</article>
            <aside>Sidebar</aside>
          </main>
          <footer>Footer</footer>
        </div>
      );
      const layout = RootLayout({ children });

      expect(layout.type).toBe('html');
      expect(layout.props.lang).toBe('en');

      const bodyElement = layout.props.children;
      expect(bodyElement.type).toBe('body');
      expect(bodyElement.props.children).toEqual(children);
    });

    it('should be compatible with Next.js page components', () => {
      const PageComponent = () => <div>Page Component</div>;
      const children = <PageComponent />;
      const layout = RootLayout({ children });

      expect(layout.type).toBe('html');
      expect(layout.props.children.type).toBe('body');
    });
  });

  describe('Type Safety', () => {
    it('should accept ReactNode as children', () => {
      const stringChild: React.ReactNode = 'String child';
      const numberChild: React.ReactNode = 123;
      const elementChild: React.ReactNode = <div>Element</div>;

      expect(() => RootLayout({ children: stringChild })).not.toThrow();
      expect(() => RootLayout({ children: numberChild })).not.toThrow();
      expect(() => RootLayout({ children: elementChild })).not.toThrow();
    });

    it('should enforce Readonly children prop', () => {
      const children: Readonly<React.ReactNode> = <div>Test</div>;
      const layout = RootLayout({ children });

      expect(layout).toBeDefined();
    });
  });
});
