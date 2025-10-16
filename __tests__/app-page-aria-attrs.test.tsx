import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home (app/page) ARIA attributes', () => {
  it('sets tablist and tab semantics with aria-selected', () => {
    render(<Home />);

    // Tablist present
    const tablist = screen.getByRole('tablist', { name: /primary sections/i });
    expect(tablist).toBeInTheDocument();

    // Tabs present with aria-selected attributes
    const settings = screen.getByRole('tab', { name: /settings/i });
    const news = screen.getByRole('tab', { name: /news/i });
    const policy = screen.getByRole('tab', { name: /agent policy/i });

    expect(settings).toHaveAttribute('aria-selected', 'true');
    expect(news).toHaveAttribute('aria-selected', 'false');
    expect(policy).toHaveAttribute('aria-selected', 'false');
  });
});
