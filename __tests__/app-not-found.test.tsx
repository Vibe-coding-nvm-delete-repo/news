import React from 'react';
import { render, screen } from '@testing-library/react';
import NotFound from '../app/not-found';

describe('NotFound (app/not-found.tsx)', () => {
  it('renders 404 message and link to home', () => {
    render(<NotFound />);

    expect(
      screen.getByRole('heading', { name: /page not found/i })
    ).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /back to home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });
});
