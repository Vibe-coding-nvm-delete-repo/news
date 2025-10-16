import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorComponent from '../app/error';

describe('App Error Boundary (app/error.tsx)', () => {
  it('renders fallback UI and allows retry', () => {
    const reset = jest.fn();
    const error = new Error('boom');

    render(<ErrorComponent error={error as any} reset={reset} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /retry/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(reset).toHaveBeenCalled();
  });
});
