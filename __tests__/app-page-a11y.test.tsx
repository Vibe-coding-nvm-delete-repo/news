import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home (app/page)', () => {
  it('renders tab navigation with accessible labels', () => {
    render(<Home />);

    expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /news/i })).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /agent policy/i })
    ).toBeInTheDocument();
  });
});
