import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';

// Mock the dynamic imports
jest.mock('@/components/SettingsTab', () => {
  return function MockSettingsTab() {
    return <div data-testid="settings-tab">Settings Tab Content</div>;
  };
});

jest.mock('@/components/NewsTab', () => {
  return function MockNewsTab() {
    return <div data-testid="news-tab">News Tab Content</div>;
  };
});

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the main page structure', () => {
      render(<Home />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('main')).toHaveClass(
        'min-h-screen',
        'bg-gradient-to-br',
        'from-slate-50',
        'to-slate-100'
      );
    });

    it('should render the page title and description', () => {
      render(<Home />);

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /news report generator/i,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/ai-powered news aggregation and analysis/i)
      ).toBeInTheDocument();
    });

    it('should render both tab buttons', () => {
      render(<Home />);

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      const newsButton = screen.getByRole('button', { name: /news/i });

      expect(settingsButton).toBeInTheDocument();
      expect(newsButton).toBeInTheDocument();
    });

    it('should apply correct container styling', () => {
      render(<Home />);

      const container = screen.getByRole('main').querySelector('.mx-auto');
      expect(container).toHaveClass('max-w-[1200px]', 'px-4', 'py-8');
    });
  });

  describe('Initial State', () => {
    it('should show settings tab by default', async () => {
      render(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('settings-tab')).toBeInTheDocument();
      });
    });

    it('should not show news tab initially', () => {
      render(<Home />);

      expect(screen.queryByTestId('news-tab')).not.toBeInTheDocument();
    });

    it('should apply active styling to settings button by default', () => {
      render(<Home />);

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      expect(settingsButton).toHaveClass(
        'text-blue-600',
        'border-b-2',
        'border-blue-600'
      );
    });

    it('should apply inactive styling to news button by default', () => {
      render(<Home />);

      const newsButton = screen.getByRole('button', { name: /news/i });
      expect(newsButton).toHaveClass('text-slate-600');
      expect(newsButton).not.toHaveClass(
        'text-blue-600',
        'border-b-2',
        'border-blue-600'
      );
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to news tab when news button is clicked', async () => {
      render(<Home />);

      const newsButton = screen.getByRole('button', { name: /news/i });
      fireEvent.click(newsButton);

      await waitFor(() => {
        expect(screen.getByTestId('news-tab')).toBeInTheDocument();
      });
    });

    it('should hide settings tab when switching to news tab', async () => {
      render(<Home />);

      const newsButton = screen.getByRole('button', { name: /news/i });
      fireEvent.click(newsButton);

      await waitFor(() => {
        expect(screen.queryByTestId('settings-tab')).not.toBeInTheDocument();
      });
    });

    it('should switch back to settings tab when settings button is clicked', async () => {
      render(<Home />);

      // Switch to news
      const newsButton = screen.getByRole('button', { name: /news/i });
      fireEvent.click(newsButton);

      await waitFor(() => {
        expect(screen.getByTestId('news-tab')).toBeInTheDocument();
      });

      // Switch back to settings
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      fireEvent.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByTestId('settings-tab')).toBeInTheDocument();
        expect(screen.queryByTestId('news-tab')).not.toBeInTheDocument();
      });
    });

    it('should update button styling when switching tabs', async () => {
      render(<Home />);

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      const newsButton = screen.getByRole('button', { name: /news/i });

      // Click news button
      fireEvent.click(newsButton);

      await waitFor(() => {
        expect(newsButton).toHaveClass(
          'text-blue-600',
          'border-b-2',
          'border-blue-600'
        );
        expect(settingsButton).toHaveClass('text-slate-600');
        expect(settingsButton).not.toHaveClass(
          'text-blue-600',
          'border-b-2',
          'border-blue-600'
        );
      });
    });

    it('should maintain tab state after multiple clicks', async () => {
      render(<Home />);

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      const newsButton = screen.getByRole('button', { name: /news/i });

      // Multiple clicks
      fireEvent.click(newsButton);
      await waitFor(() =>
        expect(screen.getByTestId('news-tab')).toBeInTheDocument()
      );

      fireEvent.click(settingsButton);
      await waitFor(() =>
        expect(screen.getByTestId('settings-tab')).toBeInTheDocument()
      );

      fireEvent.click(newsButton);
      await waitFor(() =>
        expect(screen.getByTestId('news-tab')).toBeInTheDocument()
      );

      fireEvent.click(newsButton); // Click same tab again
      await waitFor(() =>
        expect(screen.getByTestId('news-tab')).toBeInTheDocument()
      );
    });
  });

  describe('Layout Structure', () => {
    it('should render tab navigation with proper border styling', () => {
      render(<Home />);

      const tabNav = screen.getByRole('button', {
        name: /settings/i,
      }).parentElement;
      expect(tabNav).toHaveClass('border-b', 'border-slate-200');
    });

    it('should render tab content container with proper styling', () => {
      render(<Home />);

      const contentContainer = screen.getByTestId('settings-tab').parentElement;
      expect(contentContainer).toHaveClass(
        'bg-white',
        'rounded-lg',
        'shadow-lg',
        'p-6'
      );
    });

    it('should have proper spacing between elements', () => {
      render(<Home />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading.parentElement).toHaveClass('mb-8');
    });
  });

  describe('Button Interactions', () => {
    it('should have hover styles applied to buttons', () => {
      render(<Home />);

      const newsButton = screen.getByRole('button', { name: /news/i });
      expect(newsButton).toHaveClass('hover:text-slate-900');
    });

    it('should have transition classes on buttons', () => {
      render(<Home />);

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      const newsButton = screen.getByRole('button', { name: /news/i });

      expect(settingsButton).toHaveClass('transition-colors');
      expect(newsButton).toHaveClass('transition-colors');
    });

    it('should have proper button padding', () => {
      render(<Home />);

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      expect(settingsButton).toHaveClass('px-6', 'py-3');
    });

    it('should have font-medium class on buttons', () => {
      render(<Home />);

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      const newsButton = screen.getByRole('button', { name: /news/i });

      expect(settingsButton).toHaveClass('font-medium');
      expect(newsButton).toHaveClass('font-medium');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic HTML structure', () => {
      render(<Home />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    it('should have descriptive button labels', () => {
      render(<Home />);

      expect(
        screen.getByRole('button', { name: /settings/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /news/i })).toBeInTheDocument();
    });

    it('should indicate active tab visually', () => {
      render(<Home />);

      const activeButton = screen.getByRole('button', { name: /settings/i });
      expect(activeButton).toHaveClass('border-b-2', 'border-blue-600');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid tab switching', async () => {
      render(<Home />);

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      const newsButton = screen.getByRole('button', { name: /news/i });

      // Rapid clicks
      fireEvent.click(newsButton);
      fireEvent.click(settingsButton);
      fireEvent.click(newsButton);
      fireEvent.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByTestId('settings-tab')).toBeInTheDocument();
      });
    });

    it('should render correctly when Settings tab is explicitly selected', async () => {
      render(<Home />);

      const settingsButton = screen.getByRole('button', { name: /settings/i });

      // Click settings even though it's already active
      fireEvent.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByTestId('settings-tab')).toBeInTheDocument();
      });
    });
  });
});
