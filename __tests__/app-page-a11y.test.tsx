import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home (app/page)', () => {
  it('renders tab navigation with accessible labels', () => {
    render(<Home />);

    expect(
      screen.getByRole('button', { name: /settings/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /news/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /agent policy/i })
    ).toBeInTheDocument();
  });
});
