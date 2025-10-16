import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActiveCardsTab from '@/components/ActiveCardsTab';
import { useStore } from '@/lib/store';

// Mock the store
jest.mock('@/lib/store', () => ({
  useStore: jest.fn(),
}));

// Mock the child components
jest.mock('@/components/NewsCard', () => {
  return function MockNewsCard({ card, showReadButton, onMarkAsRead }: any) {
    return (
      <div data-testid={`news-card-${card.id}`}>
        {card.title}
        {showReadButton && (
          <button onClick={() => onMarkAsRead(card.id)}>Mark as Read</button>
        )}
      </div>
    );
  };
});

jest.mock('@/components/ReportGroup', () => {
  return function MockReportGroup({
    reportId,
    keywords,
    cardCount,
    cost,
  }: any) {
    return (
      <div data-testid={`report-group-${reportId}`}>
        Keywords: {keywords.join(', ')} | Cards: {cardCount}
        {cost !== undefined && ` | Cost: $${cost.toFixed(4)}`}
      </div>
    );
  };
});

describe('ActiveCardsTab', () => {
  const mockUseStore = useStore as jest.MockedFunction<typeof useStore>;
  const mockMarkCardAsRead = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no active cards', () => {
    mockUseStore.mockReturnValue({
      activeCards: [],
      reportHistory: [],
      markCardAsRead: mockMarkCardAsRead,
    } as any);

    render(<ActiveCardsTab />);

    expect(screen.getByText('No Active Cards')).toBeInTheDocument();
    expect(
      screen.getByText('Generate a report to see news cards here.')
    ).toBeInTheDocument();
  });

  it('renders active cards', () => {
    const mockCards = [
      {
        id: 'card-1',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'AI News 1',
        rating: 8.5,
        summary: 'Summary 1',
        source: null,
        url: null,
        date: '2025-10-15',
        generatedAt: '2025-10-16T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      activeCards: mockCards,
      reportHistory: [],
      markCardAsRead: mockMarkCardAsRead,
    } as any);

    render(<ActiveCardsTab />);

    expect(screen.getByText('Active Cards')).toBeInTheDocument();
    expect(screen.getByTestId('news-card-card-1')).toBeInTheDocument();
  });

  it('calculates and displays average rating', () => {
    const mockCards = [
      {
        id: 'card-1',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Card 1',
        rating: 8.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
      {
        id: 'card-2',
        reportId: 'report-1',
        keyword: 'ML',
        category: 'Tech',
        title: 'Card 2',
        rating: 6.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      activeCards: mockCards,
      reportHistory: [],
      markCardAsRead: mockMarkCardAsRead,
    } as any);

    render(<ActiveCardsTab />);

    // Average of 8.0 and 6.0 is 7.0
    expect(screen.getByText('7.0/10')).toBeInTheDocument();
  });

  it('displays card count', () => {
    const mockCards = [
      {
        id: 'card-1',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Card 1',
        rating: 8.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
      {
        id: 'card-2',
        reportId: 'report-1',
        keyword: 'ML',
        category: 'Tech',
        title: 'Card 2',
        rating: 7.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      activeCards: mockCards,
      reportHistory: [],
      markCardAsRead: mockMarkCardAsRead,
    } as any);

    render(<ActiveCardsTab />);

    expect(screen.getByText('2 cards')).toBeInTheDocument();
  });

  it('displays singular form for 1 card', () => {
    const mockCards = [
      {
        id: 'card-1',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Card 1',
        rating: 8.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      activeCards: mockCards,
      reportHistory: [],
      markCardAsRead: mockMarkCardAsRead,
    } as any);

    render(<ActiveCardsTab />);

    expect(screen.getByText('1 card')).toBeInTheDocument();
  });

  it('groups cards by reportId', () => {
    const mockCards = [
      {
        id: 'card-1',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Report 1 Card',
        rating: 8.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
      {
        id: 'card-2',
        reportId: 'report-2',
        keyword: 'ML',
        category: 'Science',
        title: 'Report 2 Card',
        rating: 7.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-15T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      activeCards: mockCards,
      reportHistory: [
        { id: 'report-1', generatedAt: '2025-10-16T10:00:00Z' },
        { id: 'report-2', generatedAt: '2025-10-15T10:00:00Z' },
      ],
      markCardAsRead: mockMarkCardAsRead,
    } as any);

    render(<ActiveCardsTab />);

    expect(screen.getByTestId('report-group-report-1')).toBeInTheDocument();
    expect(screen.getByTestId('report-group-report-2')).toBeInTheDocument();
  });

  it('sorts by rating by default (highest first)', () => {
    const mockCards = [
      {
        id: 'card-low',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Low Rating',
        rating: 5.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
      {
        id: 'card-high',
        reportId: 'report-1',
        keyword: 'ML',
        category: 'Tech',
        title: 'High Rating',
        rating: 9.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      activeCards: mockCards,
      reportHistory: [],
      markCardAsRead: mockMarkCardAsRead,
    } as any);

    const { container } = render(<ActiveCardsTab />);
    const cards = container.querySelectorAll('[data-testid^="news-card-"]');

    // High rating should appear first
    expect(cards[0]).toHaveAttribute('data-testid', 'news-card-card-high');
    expect(cards[1]).toHaveAttribute('data-testid', 'news-card-card-low');
  });

  it('sorts by category when category button is clicked', () => {
    const mockCards = [
      {
        id: 'card-tech',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Technology',
        title: 'Tech Card',
        rating: 8.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
      {
        id: 'card-business',
        reportId: 'report-1',
        keyword: 'ML',
        category: 'Business',
        title: 'Business Card',
        rating: 8.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      activeCards: mockCards,
      reportHistory: [],
      markCardAsRead: mockMarkCardAsRead,
    } as any);

    const { container } = render(<ActiveCardsTab />);

    const categoryButton = screen.getByRole('button', { name: /category/i });
    fireEvent.click(categoryButton);

    const cards = container.querySelectorAll('[data-testid^="news-card-"]');

    // Business should appear first (alphabetically)
    expect(cards[0]).toHaveAttribute('data-testid', 'news-card-card-business');
    expect(cards[1]).toHaveAttribute('data-testid', 'news-card-card-tech');
  });

  it('sorts by keyword when keyword button is clicked', () => {
    const mockCards = [
      {
        id: 'card-ml',
        reportId: 'report-1',
        keyword: 'ML',
        category: 'Tech',
        title: 'ML Card',
        rating: 8.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
      {
        id: 'card-ai',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'AI Card',
        rating: 8.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      activeCards: mockCards,
      reportHistory: [],
      markCardAsRead: mockMarkCardAsRead,
    } as any);

    const { container } = render(<ActiveCardsTab />);

    const keywordButton = screen.getByRole('button', { name: /keyword/i });
    fireEvent.click(keywordButton);

    const cards = container.querySelectorAll('[data-testid^="news-card-"]');

    // AI should appear first (alphabetically)
    expect(cards[0]).toHaveAttribute('data-testid', 'news-card-card-ai');
    expect(cards[1]).toHaveAttribute('data-testid', 'news-card-card-ml');
  });

  it('sorts by date when date button is clicked', () => {
    const mockCards = [
      {
        id: 'card-old',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Old Card',
        rating: 8.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: '2025-10-10',
        generatedAt: '2025-10-16T10:00:00Z',
      },
      {
        id: 'card-new',
        reportId: 'report-1',
        keyword: 'ML',
        category: 'Tech',
        title: 'New Card',
        rating: 8.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: '2025-10-15',
        generatedAt: '2025-10-16T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      activeCards: mockCards,
      reportHistory: [],
      markCardAsRead: mockMarkCardAsRead,
    } as any);

    const { container } = render(<ActiveCardsTab />);

    const dateButton = screen.getByRole('button', { name: /date/i });
    fireEvent.click(dateButton);

    const cards = container.querySelectorAll('[data-testid^="news-card-"]');

    // Newer date should appear first
    expect(cards[0]).toHaveAttribute('data-testid', 'news-card-card-new');
    expect(cards[1]).toHaveAttribute('data-testid', 'news-card-card-old');
  });

  it('highlights active sort button', () => {
    const mockCards = [
      {
        id: 'card-1',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Card 1',
        rating: 8.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      activeCards: mockCards,
      reportHistory: [],
      markCardAsRead: mockMarkCardAsRead,
    } as any);

    render(<ActiveCardsTab />);

    const ratingButton = screen.getByRole('button', { name: /rating/i });
    const categoryButton = screen.getByRole('button', { name: /category/i });

    // Rating is active by default
    expect(ratingButton).toHaveClass('bg-blue-600');
    expect(categoryButton).toHaveClass('bg-slate-100');

    // Click category button
    fireEvent.click(categoryButton);

    expect(categoryButton).toHaveClass('bg-blue-600');
    expect(ratingButton).toHaveClass('bg-slate-100');
  });

  it('shows read button on cards', () => {
    const mockCards = [
      {
        id: 'card-1',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Card 1',
        rating: 8.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      activeCards: mockCards,
      reportHistory: [],
      markCardAsRead: mockMarkCardAsRead,
    } as any);

    render(<ActiveCardsTab />);

    expect(
      screen.getByRole('button', { name: /mark as read/i })
    ).toBeInTheDocument();
  });

  it('calls markCardAsRead when read button is clicked', () => {
    const mockCards = [
      {
        id: 'card-1',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Card 1',
        rating: 8.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      activeCards: mockCards,
      reportHistory: [],
      markCardAsRead: mockMarkCardAsRead,
    } as any);

    render(<ActiveCardsTab />);

    const readButton = screen.getByRole('button', { name: /mark as read/i });
    fireEvent.click(readButton);

    expect(mockMarkCardAsRead).toHaveBeenCalledWith('card-1');
  });

  it('displays unique keywords from cards in report group', () => {
    const mockCards = [
      {
        id: 'card-1',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Card 1',
        rating: 8.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
      {
        id: 'card-2',
        reportId: 'report-1',
        keyword: 'ML',
        category: 'Tech',
        title: 'Card 2',
        rating: 7.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
      {
        id: 'card-3',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Card 3',
        rating: 6.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      activeCards: mockCards,
      reportHistory: [],
      markCardAsRead: mockMarkCardAsRead,
    } as any);

    render(<ActiveCardsTab />);

    // Should show unique keywords: AI and ML (not AI twice)
    const reportGroup = screen.getByTestId('report-group-report-1');
    expect(reportGroup).toHaveTextContent('Keywords: AI, ML');
    expect(reportGroup).toHaveTextContent('Cards: 3');
  });

  it('displays cost from report history', () => {
    const mockCards = [
      {
        id: 'card-1',
        reportId: 'report-1',
        keyword: 'AI',
        category: 'Tech',
        title: 'Card 1',
        rating: 8.0,
        summary: 'Summary',
        source: null,
        url: null,
        date: null,
        generatedAt: '2025-10-16T10:00:00Z',
      },
    ];

    mockUseStore.mockReturnValue({
      activeCards: mockCards,
      reportHistory: [
        {
          id: 'report-1',
          costSpent: 0.1234,
          generatedAt: '2025-10-16T10:00:00Z',
        },
      ],
      markCardAsRead: mockMarkCardAsRead,
    } as any);

    render(<ActiveCardsTab />);

    const reportGroup = screen.getByTestId('report-group-report-1');
    expect(reportGroup).toHaveTextContent('Cost: $0.1234');
  });
});
