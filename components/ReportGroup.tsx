'use client';

import { Clock, Hash, DollarSign, Sparkles } from 'lucide-react';

interface ReportGroupProps {
  reportId: string;
  generatedAt: string;
  keywords: string[];
  cardCount: number;
  cost?: number;
}

export default function ReportGroup({ reportId, generatedAt, keywords, cardCount, cost }: ReportGroupProps) {
  const date = new Date(generatedAt);
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
  const formattedTime = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            <div>
              <p className="text-sm font-semibold text-indigo-900">{formattedDate}</p>
              <p className="text-xs text-indigo-600">{formattedTime}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-indigo-200">
            <Hash className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-slate-700">
              {keywords.join(', ')}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-indigo-200">
            <Sparkles className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-slate-700">
              {cardCount} {cardCount === 1 ? 'card' : 'cards'}
            </span>
          </div>

          {cost !== undefined && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-green-200">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-mono font-medium text-green-700">
                ${cost.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
