import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NewsCard from '@/components/NewsCard';
import { Card as CardType } from '@/lib/store';

describe('NewsCard', () => {
  const mockCard: CardType = {
    id: 'card-1',
    reportId: 'report-1',
    keyword: 'AI',
    category: 'Technology',
    title: 'Breaking AI News',
    rating: 8.5,
    summary: 'This is a test summary about AI developments.',
    source: 'Tech News',
    url: 'https://example.com/article',
    date: '2025-10-15',
    generatedAt: '2025-10-16T10:00:00Z',
    status: 'active',
  };

  const mockCardWithoutOptionalFields: CardType = {
    id: 'card-2',
    reportId: 'report-1',
    keyword: 'Tech',
    category: 'Science',
    title: 'Science Update',
    rating: 7.0,
    summary: 'A brief science update.',
    source: null,
    url: null,
    date: null,
    generatedAt: '2025-10-16T11:00:00Z',
    status: 'active',
  };

  const mockArchivedCard: CardType = {
    ...mockCard,
    id: 'card-3',
    archivedAt: '2025-10-15T10:00:00Z',
    status: 'archived',
  };

  it('renders card with all information', () => {
    render(<NewsCard card={mockCard} />);

    expect(screen.getByText('Breaking AI News')).toBeInTheDocument();
    expect(
      screen.getByText('This is a test summary about AI developments.')
    ).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('Source: Tech News')).toBeInTheDocument();
    expect(screen.getByText('2025-10-15')).toBeInTheDocument();
  });

  it('renders link to full article when url is provided', () => {
    render(<NewsCard card={mockCard} />);

    const link = screen.getByRole('link', { name: /read full article/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com/article');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does not render link when url is null', () => {
    render(<NewsCard card={mockCardWithoutOptionalFields} />);

    const link = screen.queryByRole('link', { name: /read full article/i });
    expect(link).not.toBeInTheDocument();
  });

  it('does not render source when source is null', () => {
    render(<NewsCard card={mockCardWithoutOptionalFields} />);

    expect(screen.queryByText(/Source:/)).not.toBeInTheDocument();
  });

  it('does not render date when date is null', () => {
    render(<NewsCard card={mockCardWithoutOptionalFields} />);

    // Check that the date string is not in the document
    expect(screen.queryByText('2025-10-15')).not.toBeInTheDocument();
  });

  it('formats rating to one decimal place', () => {
    const cardWithPreciseRating: CardType = {
      ...mockCard,
      rating: 7.666666,
      status: 'active',
    };

    render(<NewsCard card={cardWithPreciseRating} />);
    expect(screen.getByText('7.7')).toBeInTheDocument();
  });

  it('displays archived date when card is archived', () => {
    render(<NewsCard card={mockArchivedCard} />);

    const archivedDate = new Date('2025-10-15T10:00:00Z').toLocaleDateString();
    expect(screen.getByText(`Archived: ${archivedDate}`)).toBeInTheDocument();
  });

  it('shows read button when showReadButton is true', () => {
    const mockOnMarkAsRead = jest.fn();
    render(
      <NewsCard
        card={mockCard}
        showReadButton={true}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    const readButton = screen.getByRole('button', { name: /read/i });
    expect(readButton).toBeInTheDocument();
  });

  it('does not show read button when showReadButton is false', () => {
    const mockOnMarkAsRead = jest.fn();
    render(
      <NewsCard
        card={mockCard}
        showReadButton={false}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    const readButton = screen.queryByRole('button', { name: /read/i });
    expect(readButton).not.toBeInTheDocument();
  });

  it('does not show read button when onMarkAsRead is not provided', () => {
    render(<NewsCard card={mockCard} showReadButton={true} />);

    const readButton = screen.queryByRole('button', { name: /read/i });
    expect(readButton).not.toBeInTheDocument();
  });

  it('calls onMarkAsRead with card id when read button is clicked', () => {
    const mockOnMarkAsRead = jest.fn();
    render(
      <NewsCard
        card={mockCard}
        showReadButton={true}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    const readButton = screen.getByRole('button', { name: /read/i });
    fireEvent.click(readButton);

    expect(mockOnMarkAsRead).toHaveBeenCalledWith('card-1');
    expect(mockOnMarkAsRead).toHaveBeenCalledTimes(1);
  });

  it('renders with default showReadButton value', () => {
    render(<NewsCard card={mockCard} />);

    const readButton = screen.queryByRole('button', { name: /read/i });
    expect(readButton).not.toBeInTheDocument();
  });

  it('handles multiple clicks on read button', () => {
    const mockOnMarkAsRead = jest.fn();
    render(
      <NewsCard
        card={mockCard}
        showReadButton={true}
        onMarkAsRead={mockOnMarkAsRead}
      />
    );

    const readButton = screen.getByRole('button', { name: /read/i });
    fireEvent.click(readButton);
    fireEvent.click(readButton);
    fireEvent.click(readButton);

    expect(mockOnMarkAsRead).toHaveBeenCalledTimes(3);
  });
});
