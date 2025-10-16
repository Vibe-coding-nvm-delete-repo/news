import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Textarea } from '@/components/ui/textarea';

describe('Textarea', () => {
  it('renders textarea element', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Textarea placeholder="Enter description" />);
    expect(
      screen.getByPlaceholderText('Enter description')
    ).toBeInTheDocument();
  });

  it('renders with value', () => {
    render(<Textarea value="Test content" readOnly />);
    expect(screen.getByDisplayValue('Test content')).toBeInTheDocument();
  });

  it('handles onChange events', () => {
    const handleChange = jest.fn();
    render(<Textarea onChange={handleChange} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'new content' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('accepts custom className', () => {
    const { container } = render(<Textarea className="custom-textarea" />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('custom-textarea');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('accepts standard textarea HTML attributes', () => {
    render(
      <Textarea
        name="description"
        id="desc-textarea"
        rows={5}
        cols={50}
        maxLength={500}
        required
        aria-label="Description"
      />
    );

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('name', 'description');
    expect(textarea).toHaveAttribute('id', 'desc-textarea');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveAttribute('cols', '50');
    expect(textarea).toHaveAttribute('maxLength', '500');
    expect(textarea).toHaveAttribute('required');
    expect(textarea).toHaveAttribute('aria-label', 'Description');
  });

  it('handles focus events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    render(<Textarea onFocus={handleFocus} onBlur={handleBlur} />);

    const textarea = screen.getByRole('textbox');
    fireEvent.focus(textarea);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    fireEvent.blur(textarea);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('can be read-only', () => {
    render(<Textarea value="Read only content" readOnly />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('readOnly');
  });

  it('has correct display name', () => {
    expect(Textarea.displayName).toBe('Textarea');
  });

  it('applies base styling classes', () => {
    const { container } = render(<Textarea />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('rounded-md');
    expect(textarea).toHaveClass('border');
    expect(textarea).toHaveClass('min-h-[80px]');
  });

  it('handles multiline text', () => {
    const multilineText = 'Line 1\nLine 2\nLine 3';
    const { container } = render(<Textarea value={multilineText} readOnly />);
    const textarea = container.querySelector('textarea');
    expect(textarea?.value).toBe(multilineText);
  });

  it('supports controlled component pattern', () => {
    const { rerender } = render(<Textarea value="Initial" readOnly />);
    expect(screen.getByDisplayValue('Initial')).toBeInTheDocument();

    rerender(<Textarea value="Updated" readOnly />);
    expect(screen.getByDisplayValue('Updated')).toBeInTheDocument();
  });
});
