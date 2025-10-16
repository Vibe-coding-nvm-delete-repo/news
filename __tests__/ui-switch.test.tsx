import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Switch } from '@/components/ui/switch';

describe('Switch', () => {
  it('renders with unchecked state', () => {
    const handleChange = jest.fn();
    render(<Switch checked={false} onCheckedChange={handleChange} />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('renders with checked state', () => {
    const handleChange = jest.fn();
    render(<Switch checked={true} onCheckedChange={handleChange} />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onCheckedChange with true when clicked while unchecked', () => {
    const handleChange = jest.fn();
    render(<Switch checked={false} onCheckedChange={handleChange} />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(handleChange).toHaveBeenCalledWith(true);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('calls onCheckedChange with false when clicked while checked', () => {
    const handleChange = jest.fn();
    render(<Switch checked={true} onCheckedChange={handleChange} />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(handleChange).toHaveBeenCalledWith(false);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    const handleChange = jest.fn();
    render(<Switch checked={false} onCheckedChange={handleChange} disabled />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();

    fireEvent.click(switchElement);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('applies correct styling when checked', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <Switch checked={true} onCheckedChange={handleChange} />
    );

    const switchElement = container.querySelector('button');
    expect(switchElement).toHaveClass('bg-primary');
  });

  it('applies correct styling when unchecked', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <Switch checked={false} onCheckedChange={handleChange} />
    );

    const switchElement = container.querySelector('button');
    expect(switchElement).toHaveClass('bg-input');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    const handleChange = jest.fn();
    render(<Switch ref={ref} checked={false} onCheckedChange={handleChange} />);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('has button type attribute', () => {
    const handleChange = jest.fn();
    render(<Switch checked={false} onCheckedChange={handleChange} />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('type', 'button');
  });

  it('handles multiple rapid clicks', () => {
    const handleChange = jest.fn();
    render(<Switch checked={false} onCheckedChange={handleChange} />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);
    fireEvent.click(switchElement);
    fireEvent.click(switchElement);

    expect(handleChange).toHaveBeenCalledTimes(3);
  });

  it('has correct display name', () => {
    expect(Switch.displayName).toBe('Switch');
  });

  it('contains thumb element', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <Switch checked={false} onCheckedChange={handleChange} />
    );

    const thumb = container.querySelector('span');
    expect(thumb).toBeInTheDocument();
    expect(thumb).toHaveClass('rounded-full');
  });

  it('thumb translates when checked', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <Switch checked={true} onCheckedChange={handleChange} />
    );

    const thumb = container.querySelector('span');
    expect(thumb).toHaveClass('translate-x-5');
  });

  it('thumb does not translate when unchecked', () => {
    const handleChange = jest.fn();
    const { container } = render(
      <Switch checked={false} onCheckedChange={handleChange} />
    );

    const thumb = container.querySelector('span');
    expect(thumb).toHaveClass('translate-x-0');
  });
});
