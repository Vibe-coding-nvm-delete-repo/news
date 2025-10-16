import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DateFilterDropdown, {
  DateFilterOption,
} from '@/components/DateFilterDropdown';

describe('DateFilterDropdown', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with default value "all"', () => {
    render(<DateFilterDropdown value="all" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('all');
  });

  it('renders all filter options', () => {
    render(<DateFilterDropdown value="all" onChange={mockOnChange} />);

    expect(
      screen.getByRole('option', { name: 'All Time' })
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Today' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Last 7 Days' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Last 30 Days' })
    ).toBeInTheDocument();
  });

  it('displays the correct selected value', () => {
    const { rerender } = render(
      <DateFilterDropdown value="today" onChange={mockOnChange} />
    );

    let select = screen.getByRole('combobox');
    expect(select).toHaveValue('today');

    rerender(<DateFilterDropdown value="last7days" onChange={mockOnChange} />);
    select = screen.getByRole('combobox');
    expect(select).toHaveValue('last7days');

    rerender(<DateFilterDropdown value="last30days" onChange={mockOnChange} />);
    select = screen.getByRole('combobox');
    expect(select).toHaveValue('last30days');
  });

  it('calls onChange with "today" when Today is selected', () => {
    render(<DateFilterDropdown value="all" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'today' } });

    expect(mockOnChange).toHaveBeenCalledWith('today');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange with "last7days" when Last 7 Days is selected', () => {
    render(<DateFilterDropdown value="all" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'last7days' } });

    expect(mockOnChange).toHaveBeenCalledWith('last7days');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange with "last30days" when Last 30 Days is selected', () => {
    render(<DateFilterDropdown value="all" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'last30days' } });

    expect(mockOnChange).toHaveBeenCalledWith('last30days');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange with "all" when All Time is selected', () => {
    render(<DateFilterDropdown value="today" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'all' } });

    expect(mockOnChange).toHaveBeenCalledWith('all');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('renders filter icon', () => {
    const { container } = render(
      <DateFilterDropdown value="all" onChange={mockOnChange} />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('does not call onChange on initial render', () => {
    render(<DateFilterDropdown value="all" onChange={mockOnChange} />);
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('handles rapid changes', () => {
    render(<DateFilterDropdown value="all" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'today' } });
    fireEvent.change(select, { target: { value: 'last7days' } });
    fireEvent.change(select, { target: { value: 'last30days' } });
    fireEvent.change(select, { target: { value: 'all' } });

    expect(mockOnChange).toHaveBeenCalledTimes(4);
  });

  it('has correct accessibility attributes', () => {
    render(<DateFilterDropdown value="all" onChange={mockOnChange} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });
});
