'use client';

import { useStore } from '@/lib/store';
import NewsCard from './NewsCard';
import ReportGroup from './ReportGroup';
import { FileText } from 'lucide-react';

export default function ActiveCardsTab() {
  const { activeCards, reportHistory, markCardAsRead } = useStore();

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

  // Sort cards within each report by rating (high to low)
  Object.keys(cardsByReport).forEach(reportId => {
    cardsByReport[reportId].sort((a, b) => b.rating - a.rating);
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Active Cards</h2>
        <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
          {activeCards.length} {activeCards.length === 1 ? 'card' : 'cards'}
        </span>
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
