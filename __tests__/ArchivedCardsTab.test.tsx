import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ArchivedCardsTab from '@/components/ArchivedCardsTab';
import { useStore } from '@/lib/store';

// Mock the store
jest.mock('@/lib/store', () => ({
  useStore: jest.fn(),
}));

// Mock the child components
jest.mock('@/components/NewsCard', () => {
  return function MockNewsCard({ card }: any) {
    return <div data-testid={`news-card-${card.id}`}>{card.title}</div>;
  };
});

jest.mock('@/components/DateFilterDropdown', () => {
  return function MockDateFilterDropdown({ value, onChange }: any) {
    return (
      <select
        data-testid="date-filter"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="last7days">Last 7 Days</option>
        <option value="last30days">Last 30 Days</option>
      </select>
    );
  };
});

describe('ArchivedCardsTab', () => {
  const mockUseStore = useStore as jest.MockedFunction<typeof useStore>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no archived cards', () => {
    mockUseStore.mockReturnValue({
      archivedCards: [],
    } as any);

    render(<ArchivedCardsTab />);

    expect(screen.getByText('No Archived Cards')).toBeInTheDocument();
    expect(
      screen.getByText('Cards marked as "Read" will appear here.')
    ).toBeInTheDocument();
  });

  it('renders archived cards', () => {
    const mockCards = [
      {
        id: 'card-1',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'AI News 1',
        rating: 8,
        summary: 'Summary 1',
        source: 'Source 1',
        url: 'http://example.com',
        date: '2025-10-15',
        generatedAt: '2025-10-15T10:00:00Z',
        archivedAt: '2025-10-16T10:00:00Z',
      },
      {
        id: 'card-2',
        reportId: 'report-1',
        keyword: 'ML',
        category: 'Tech',
        title: 'ML News 2',
        rating: 7,
        summary: 'Summary 2',
        source: 'Source 2',
        url: 'http://example.com',
        date: '2025-10-14',
        generatedAt: '2025-10-14T10:00:00Z',
        archivedAt: '2025-10-15T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      archivedCards: mockCards,
    } as any);

    render(<ArchivedCardsTab />);

    expect(screen.getByText('Archived Cards')).toBeInTheDocument();
    expect(screen.getByTestId('news-card-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('news-card-card-2')).toBeInTheDocument();
  });

  it('shows count of displayed cards', () => {
    const mockCards = [
      {
        id: 'card-1',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'AI News',
        rating: 8,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-15T10:00:00Z',
        archivedAt: '2025-10-16T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      archivedCards: mockCards,
    } as any);

    render(<ArchivedCardsTab />);

    expect(screen.getByText('1 of 1 shown')).toBeInTheDocument();
  });

  it('filters cards by today', () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const mockCards = [
      {
        id: 'card-today',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Today Card',
        rating: 8,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
        archivedAt: today.toISOString(),
      },
      {
        id: 'card-yesterday',
        reportId: 'report-1',
        keyword: 'ML',
        category: 'Tech',
        title: 'Yesterday Card',
        rating: 7,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-15T10:00:00Z',
        archivedAt: yesterday.toISOString(),
      },
    ];

    mockUseStore.mockReturnValue({
      archivedCards: mockCards,
    } as any);

    render(<ArchivedCardsTab />);

    const filter = screen.getByTestId('date-filter');
    fireEvent.change(filter, { target: { value: 'today' } });

    // Only today's card should be shown
    expect(screen.getByTestId('news-card-card-today')).toBeInTheDocument();
    expect(
      screen.queryByTestId('news-card-card-yesterday')
    ).not.toBeInTheDocument();
  });

  it('filters cards by last 7 days', () => {
    const now = new Date();
    const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    const mockCards = [
      {
        id: 'card-recent',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Recent Card',
        rating: 8,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-10T10:00:00Z',
        archivedAt: fiveDaysAgo.toISOString(),
      },
      {
        id: 'card-old',
        reportId: 'report-1',
        keyword: 'ML',
        category: 'Tech',
        title: 'Old Card',
        rating: 7,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-01T10:00:00Z',
        archivedAt: tenDaysAgo.toISOString(),
      },
    ];

    mockUseStore.mockReturnValue({
      archivedCards: mockCards,
    } as any);

    render(<ArchivedCardsTab />);

    const filter = screen.getByTestId('date-filter');
    fireEvent.change(filter, { target: { value: 'last7days' } });

    expect(screen.getByTestId('news-card-card-recent')).toBeInTheDocument();
    expect(screen.queryByTestId('news-card-card-old')).not.toBeInTheDocument();
  });

  it('shows empty filter message when no cards match filter', () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    const mockCards = [
      {
        id: 'card-old',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Old Card',
        rating: 8,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-01T10:00:00Z',
        archivedAt: tenDaysAgo.toISOString(),
      },
    ];

    mockUseStore.mockReturnValue({
      archivedCards: mockCards,
    } as any);

    render(<ArchivedCardsTab />);

    const filter = screen.getByTestId('date-filter');
    fireEvent.change(filter, { target: { value: 'today' } });

    expect(
      screen.getByText('No archived cards match the selected filter.')
    ).toBeInTheDocument();
  });

  it('sorts cards by archivedAt date (newest first)', () => {
    const mockCards = [
      {
        id: 'card-1',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Card 1',
        rating: 8,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-15T10:00:00Z',
        archivedAt: '2025-10-15T10:00:00Z',
      },
      {
        id: 'card-2',
        reportId: 'report-1',
        keyword: 'ML',
        category: 'Tech',
        title: 'Card 2',
        rating: 7,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
        archivedAt: '2025-10-16T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      archivedCards: mockCards,
    } as any);

    const { container } = render(<ArchivedCardsTab />);
    const cards = container.querySelectorAll('[data-testid^="news-card-"]');

    // Card 2 should appear first (newer archivedAt)
    expect(cards[0]).toHaveAttribute('data-testid', 'news-card-card-2');
    expect(cards[1]).toHaveAttribute('data-testid', 'news-card-card-1');
  });

  it('filters out cards without archivedAt', () => {
    const mockCards = [
      {
        id: 'card-1',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Card 1',
        rating: 8,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-15T10:00:00Z',
        archivedAt: '2025-10-16T10:00:00Z',
      },
      {
        id: 'card-2',
        reportId: 'report-1',
        keyword: 'ML',
        category: 'Tech',
        title: 'Card 2',
        rating: 7,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
        archivedAt: null,
      },
    ];

    mockUseStore.mockReturnValue({
      archivedCards: mockCards as any,
    } as any);

    render(<ArchivedCardsTab />);

    expect(screen.getByTestId('news-card-card-1')).toBeInTheDocument();
    expect(screen.queryByTestId('news-card-card-2')).not.toBeInTheDocument();
  });
});
