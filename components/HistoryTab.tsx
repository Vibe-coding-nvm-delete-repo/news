'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import {
  Clock,
  Hash,
  Sparkles,
  DollarSign,
  Cpu,
  History as HistoryIcon,
  ArrowUpDown,
  Star,
  FolderOpen,
} from 'lucide-react';

type SortOption = 'date' | 'cost' | 'cards' | 'rating';

export default function HistoryTab() {
  const { reportHistory } = useStore();
  const [sortBy, setSortBy] = useState<SortOption>('date');

  // Sort based on selected option
  const sortedHistory = [...reportHistory].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return (
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
        );
      case 'cost':
        return b.costSpent - a.costSpent;
      case 'cards':
        return b.totalCards - a.totalCards;
      case 'rating':
        return (b.avgRating || 0) - (a.avgRating || 0);
      default:
        return 0;
    }
  });

  if (reportHistory.length === 0) {
    return (
      <div className="text-center py-16">
        <HistoryIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          No Report History
        </h3>
        <p className="text-slate-500">
          Your generated reports will be tracked here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Report History</h2>
        <span className="text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
          {reportHistory.length}{' '}
          {reportHistory.length === 1 ? 'report' : 'reports'}
        </span>
      </div>

      {/* Sorting Options */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <ArrowUpDown className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Sort by:</span>
        <div className="flex gap-2">
          {(['date', 'cost', 'cards', 'rating'] as SortOption[]).map(option => (
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
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {sortedHistory.map((report, index) => {
          const date = new Date(report.generatedAt);
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={report.id}
              className="bg-white border-2 border-slate-200 rounded-lg p-5 hover:shadow-lg transition-all duration-300"
              style={{
                animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <Sparkles className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Report #{reportHistory.length - index}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock className="h-4 w-4" />
                      <span>
                        {formattedDate} at {formattedTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-900">
                      Keywords
                    </span>
                  </div>
                  <p
                    className="text-sm font-semibold text-slate-900 truncate"
                    title={report.keywords.join(', ')}
                  >
                    {report.keywords.join(', ')}
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-yellow-600" />
                    <span className="text-xs font-medium text-yellow-900">
                      Cards
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {report.totalCards}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-green-900">
                      Cost
                    </span>
                  </div>
                  <p className="text-lg font-bold text-green-900 font-mono">
                    ${report.costSpent.toFixed(4)}
                  </p>
                </div>

                {report.avgRating !== undefined && (
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-orange-600" />
                      <span className="text-xs font-medium text-orange-900">
                        Avg Rating
                      </span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">
                      {report.avgRating.toFixed(1)}/10
                    </p>
                  </div>
                )}

                {report.categories && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                      <span className="text-xs font-medium text-blue-900">
                        Categories
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {report.categories.length}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
