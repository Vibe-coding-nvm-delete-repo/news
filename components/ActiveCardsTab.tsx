'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import NewsCard from './NewsCard';
import ReportGroup from './ReportGroup';
import { FileText, ArrowUpDown, Star } from 'lucide-react';

type SortOption = 'rating' | 'category' | 'keyword' | 'date';

export default function ActiveCardsTab() {
  const { activeCards, reportHistory, markCardAsRead } = useStore();
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  // Calculate average rating
  const avgRating =
    activeCards.length > 0
      ? activeCards.reduce((sum, card) => {
          const r =
            typeof card.rating === 'number'
              ? card.rating
              : parseFloat((card as any).rating) || 0;
          return sum + r;
        }, 0) / activeCards.length
      : 0;

  // Group cards by reportId
  const cardsByReport = activeCards.reduce(
    (acc, card) => {
      if (!acc[card.reportId]) {
        acc[card.reportId] = [];
      }
      acc[card.reportId].push(card);
      return acc;
    },
    {} as Record<string, typeof activeCards>
  );

  // Sort cards within each report based on selected sort option
  Object.keys(cardsByReport).forEach(reportId => {
    cardsByReport[reportId].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'keyword':
          return a.keyword.localeCompare(b.keyword);
        case 'date':
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        default:
          return 0;
      }
    });
  });

  // Sort report IDs by generatedAt (newest first)
  const sortedReportIds = Object.keys(cardsByReport).sort((a, b) => {
    const cardA = cardsByReport[a][0];
    const cardB = cardsByReport[b][0];
    return (
      new Date(cardB.generatedAt).getTime() -
      new Date(cardA.generatedAt).getTime()
    );
  });

  if (activeCards.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          No Active Cards
        </h3>
        <p className="text-slate-500">
          Generate a report to see news cards here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border-2 border-blue-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              Active Cards
            </h2>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="font-medium">
                {activeCards.length}{' '}
                {activeCards.length === 1 ? 'card' : 'cards'}
              </span>
              {sortedReportIds.length > 0 && (
                <>
                  <span>•</span>
                  <span>
                    Report #
                    {reportHistory.length -
                      reportHistory.findIndex(h => h.id === sortedReportIds[0])}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg border border-blue-200">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <div>
              <p className="text-xs text-slate-600 font-medium">AVG RATING</p>
              <p className="text-xl font-bold text-slate-900">
                {avgRating.toFixed(1)}/10
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sorting Options */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <ArrowUpDown className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Sort by:</span>
        <div className="flex gap-2">
          {(['rating', 'category', 'keyword', 'date'] as SortOption[]).map(
            option => (
              <button
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  sortBy === option
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {sortedReportIds.map(reportId => {
        const cards = cardsByReport[reportId];
        const firstCard = cards[0];

        // Get unique keywords for this report
        const keywords = Array.from(new Set(cards.map(c => c.keyword)));

        // Find report history entry for cost
        const historyEntry = reportHistory.find(h => h.id === reportId);

        return (
          <div key={reportId} className="space-y-3">
            <ReportGroup
              reportId={reportId}
              generatedAt={firstCard.generatedAt}
              keywords={keywords}
              cardCount={cards.length}
              cost={historyEntry?.costSpent}
            />

            <div className="space-y-3 pl-4">
              {cards.map(card => (
                <NewsCard
                  key={card.id}
                  card={card}
                  showReadButton={true}
                  onMarkAsRead={markCardAsRead}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
