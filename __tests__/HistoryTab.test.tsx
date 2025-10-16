import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HistoryTab from '@/components/HistoryTab';
import { useStore } from '@/lib/store';

// Mock the store
jest.mock('@/lib/store', () => ({
  useStore: jest.fn(),
}));

describe('HistoryTab', () => {
  const mockUseStore = useStore as jest.MockedFunction<typeof useStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock date methods for consistent testing
    jest
      .spyOn(Date.prototype, 'toLocaleDateString')
      .mockReturnValue('Oct 16, 2025');
    jest
      .spyOn(Date.prototype, 'toLocaleTimeString')
      .mockReturnValue('02:30 PM');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders empty state when no report history', () => {
    mockUseStore.mockReturnValue({
      reportHistory: [],
    } as any);

    render(<HistoryTab />);

    expect(screen.getByText('No Report History')).toBeInTheDocument();
    expect(
      screen.getByText('Your generated reports will be tracked here.')
    ).toBeInTheDocument();
  });

  it('renders report history', () => {
    const mockHistory = [
      {
        id: 'report-1',
        generatedAt: '2025-10-16T10:00:00Z',
        keywords: ['AI', 'ML'],
        totalCards: 5,
        costSpent: 0.1234,
        avgRating: 8.5,
        categories: ['Tech', 'Science'],
      },
    ];

    mockUseStore.mockReturnValue({
      reportHistory: mockHistory,
    } as any);

    render(<HistoryTab />);

    expect(screen.getByText('Report History')).toBeInTheDocument();
    expect(screen.getByText('1 report')).toBeInTheDocument();
    expect(screen.getByText('Report #1')).toBeInTheDocument();
  });

  it('renders multiple reports with correct numbering', () => {
    const mockHistory = [
      {
        id: 'report-1',
        generatedAt: '2025-10-16T10:00:00Z',
        keywords: ['AI'],
        totalCards: 3,
        costSpent: 0.1,
        avgRating: 7.0,
        categories: ['Tech'],
      },
      {
        id: 'report-2',
        generatedAt: '2025-10-15T10:00:00Z',
        keywords: ['ML'],
        totalCards: 2,
        costSpent: 0.05,
        avgRating: 8.0,
        categories: ['Science'],
      },
    ];

    mockUseStore.mockReturnValue({
      reportHistory: mockHistory,
    } as any);

    render(<HistoryTab />);

    expect(screen.getByText('2 reports')).toBeInTheDocument();
    // Reports are numbered in reverse order (newest = highest number)
    expect(screen.getByText('Report #2')).toBeInTheDocument();
    expect(screen.getByText('Report #1')).toBeInTheDocument();
  });

  it('displays all report metrics', () => {
    const mockHistory = [
      {
        id: 'report-1',
        generatedAt: '2025-10-16T10:00:00Z',
        keywords: ['AI', 'Machine Learning'],
        totalCards: 10,
        costSpent: 0.5678,
        avgRating: 9.2,
        categories: ['Tech', 'Science', 'Business'],
      },
    ];

    mockUseStore.mockReturnValue({
      reportHistory: mockHistory,
    } as any);

    render(<HistoryTab />);

    expect(screen.getByText('AI, Machine Learning')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('$0.5678')).toBeInTheDocument();
    expect(screen.getByText('9.2/10')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('sorts by date (newest first) by default', () => {
    const mockHistory = [
      {
        id: 'report-1',
        generatedAt: '2025-10-15T10:00:00Z',
        keywords: ['Old'],
        totalCards: 1,
        costSpent: 0.1,
      },
      {
        id: 'report-2',
        generatedAt: '2025-10-16T10:00:00Z',
        keywords: ['New'],
        totalCards: 2,
        costSpent: 0.2,
      },
    ];

    mockUseStore.mockReturnValue({
      reportHistory: mockHistory,
    } as any);

    render(<HistoryTab />);

    const reports = screen.getAllByText(/Report #/);
    // Newest report should be numbered highest and appear first
    expect(reports[0]).toHaveTextContent('Report #2');
    expect(reports[1]).toHaveTextContent('Report #1');
  });

  it('sorts by cost when cost button is clicked', () => {
    const mockHistory = [
      {
        id: 'report-1',
        generatedAt: '2025-10-16T10:00:00Z',
        keywords: ['Cheap'],
        totalCards: 1,
        costSpent: 0.05,
      },
      {
        id: 'report-2',
        generatedAt: '2025-10-15T10:00:00Z',
        keywords: ['Expensive'],
        totalCards: 2,
        costSpent: 0.95,
      },
    ];

    mockUseStore.mockReturnValue({
      reportHistory: mockHistory,
    } as any);

    render(<HistoryTab />);

    const costButton = screen.getByRole('button', { name: /cost/i });
    fireEvent.click(costButton);

    const keywords = screen.getAllByText(/Expensive|Cheap/);
    // Expensive should appear first (highest cost)
    expect(keywords[0]).toHaveTextContent('Expensive');
  });

  it('sorts by cards when cards button is clicked', () => {
    const mockHistory = [
      {
        id: 'report-1',
        generatedAt: '2025-10-16T10:00:00Z',
        keywords: ['Few'],
        totalCards: 2,
        costSpent: 0.1,
      },
      {
        id: 'report-2',
        generatedAt: '2025-10-15T10:00:00Z',
        keywords: ['Many'],
        totalCards: 10,
        costSpent: 0.2,
      },
    ];

    mockUseStore.mockReturnValue({
      reportHistory: mockHistory,
    } as any);

    render(<HistoryTab />);

    const cardsButton = screen.getByRole('button', { name: /cards/i });
    fireEvent.click(cardsButton);

    const keywords = screen.getAllByText(/Many|Few/);
    // Many should appear first (highest card count)
    expect(keywords[0]).toHaveTextContent('Many');
  });

  it('sorts by rating when rating button is clicked', () => {
    const mockHistory = [
      {
        id: 'report-1',
        generatedAt: '2025-10-16T10:00:00Z',
        keywords: ['Low'],
        totalCards: 1,
        costSpent: 0.1,
        avgRating: 5.0,
      },
      {
        id: 'report-2',
        generatedAt: '2025-10-15T10:00:00Z',
        keywords: ['High'],
        totalCards: 1,
        costSpent: 0.1,
        avgRating: 9.5,
      },
    ];

    mockUseStore.mockReturnValue({
      reportHistory: mockHistory,
    } as any);

    render(<HistoryTab />);

    const ratingButton = screen.getByRole('button', { name: /rating/i });
    fireEvent.click(ratingButton);

    const keywords = screen.getAllByText(/High|Low/);
    // High should appear first (highest rating)
    expect(keywords[0]).toHaveTextContent('High');
  });

  it('highlights active sort button', () => {
    const mockHistory = [
      {
        id: 'report-1',
        generatedAt: '2025-10-16T10:00:00Z',
        keywords: ['AI'],
        totalCards: 1,
        costSpent: 0.1,
      },
    ];

    mockUseStore.mockReturnValue({
      reportHistory: mockHistory,
    } as any);

    render(<HistoryTab />);

    const dateButton = screen.getByRole('button', { name: /date/i });
    const costButton = screen.getByRole('button', { name: /cost/i });

    // Date is active by default
    expect(dateButton).toHaveClass('bg-blue-600');
    expect(costButton).toHaveClass('bg-slate-100');

    // Click cost button
    fireEvent.click(costButton);

    expect(costButton).toHaveClass('bg-blue-600');
    expect(dateButton).toHaveClass('bg-slate-100');
  });

  it('does not render avgRating section when undefined', () => {
    const mockHistory = [
      {
        id: 'report-1',
        generatedAt: '2025-10-16T10:00:00Z',
        keywords: ['AI'],
        totalCards: 1,
        costSpent: 0.1,
        avgRating: undefined,
      },
    ];

    mockUseStore.mockReturnValue({
      reportHistory: mockHistory,
    } as any);

    render(<HistoryTab />);

    expect(screen.queryByText(/Avg Rating/)).not.toBeInTheDocument();
  });

  it('does not render categories section when undefined', () => {
    const mockHistory = [
      {
        id: 'report-1',
        generatedAt: '2025-10-16T10:00:00Z',
        keywords: ['AI'],
        totalCards: 1,
        costSpent: 0.1,
        categories: undefined,
      },
    ];

    mockUseStore.mockReturnValue({
      reportHistory: mockHistory,
    } as any);

    render(<HistoryTab />);

    expect(screen.queryByText(/Categories/)).not.toBeInTheDocument();
  });

  it('formats cost to 4 decimal places', () => {
    const mockHistory = [
      {
        id: 'report-1',
        generatedAt: '2025-10-16T10:00:00Z',
        keywords: ['AI'],
        totalCards: 1,
        costSpent: 0.123456789,
      },
    ];

    mockUseStore.mockReturnValue({
      reportHistory: mockHistory,
    } as any);

    render(<HistoryTab />);

    expect(screen.getByText('$0.1235')).toBeInTheDocument();
  });

  it('formats avgRating to 1 decimal place', () => {
    const mockHistory = [
      {
        id: 'report-1',
        generatedAt: '2025-10-16T10:00:00Z',
        keywords: ['AI'],
        totalCards: 1,
        costSpent: 0.1,
        avgRating: 7.666666,
      },
    ];

    mockUseStore.mockReturnValue({
      reportHistory: mockHistory,
    } as any);

    render(<HistoryTab />);

    expect(screen.getByText('7.7/10')).toBeInTheDocument();
  });
});
