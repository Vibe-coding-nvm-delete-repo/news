import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../app/page';

describe('Home (app/page) ARIA tabpanels', () => {
  it('links tabs to panels and switches selection', async () => {
    render(<Home />);

    // Initial state: settings selected
    const settingsTab = screen.getByRole('tab', { name: /settings/i });
    const newsTab = screen.getByRole('tab', { name: /news/i });
    expect(settingsTab).toHaveAttribute('aria-selected', 'true');
    const settingsPanel = screen.getByRole('tabpanel');
    expect(settingsPanel).toHaveAttribute('id', 'panel-settings');

    // Switch to News
    await userEvent.click(newsTab);

    expect(newsTab).toHaveAttribute('aria-selected', 'true');
    const newsPanel = await screen.findByRole('tabpanel');
    expect(newsPanel).toHaveAttribute('id', 'panel-news');
  });
});
