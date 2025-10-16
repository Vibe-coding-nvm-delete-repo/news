'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import NewsCard from './NewsCard';
import DateFilterDropdown, { DateFilterOption } from './DateFilterDropdown';
import { Archive } from 'lucide-react';

export default function ArchivedCardsTab() {
  const { archivedCards } = useStore();
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');

  // Filter cards by date
  const filteredCards = archivedCards.filter(card => {
    if (!card.archivedAt) return false;
    
    const archivedDate = new Date(card.archivedAt);
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        return archivedDate.toDateString() === now.toDateString();
      case 'last7days':
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return archivedDate >= sevenDaysAgo;
      case 'last30days':
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return archivedDate >= thirtyDaysAgo;
      case 'all':
      default:
        return true;
    }
  });

  // Sort by archivedAt (newest first)
  const sortedCards = [...filteredCards].sort((a, b) => {
    const dateA = a.archivedAt ? new Date(a.archivedAt).getTime() : 0;
    const dateB = b.archivedAt ? new Date(b.archivedAt).getTime() : 0;
    return dateB - dateA;
  });

  if (archivedCards.length === 0) {
    return (
      <div className="text-center py-16">
        <Archive className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 mb-2">No Archived Cards</h3>
        <p className="text-slate-500">
          Cards marked as &quot;Read&quot; will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-900">Archived Cards</h2>
          <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {sortedCards.length} of {archivedCards.length} shown
          </span>
        </div>
        <DateFilterDropdown value={dateFilter} onChange={setDateFilter} />
      </div>

      {sortedCards.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <p className="text-slate-600">No archived cards match the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCards.map(card => (
            <NewsCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
