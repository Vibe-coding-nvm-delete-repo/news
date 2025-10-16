'use client';

import { useStore } from '@/lib/store';
import { Clock, Hash, Sparkles, DollarSign, Cpu } from 'lucide-react';
import { History } from 'lucide-react';

export default function HistoryTab() {
  const { reportHistory } = useStore();

  // Sort by generatedAt (newest first)
  const sortedHistory = [...reportHistory].sort((a, b) => {
    return (
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  });

  if (reportHistory.length === 0) {
    return (
      <div className="text-center py-16">
        <History className="h-16 w-16 text-slate-300 mx-auto mb-4" />
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-900">
                      Keywords
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
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

                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-900">
                      Model
                    </span>
                  </div>
                  <p
                    className="text-xs font-medium text-slate-900 truncate"
                    title={report.modelUsed}
                  >
                    {report.modelUsed.split('/').pop() || report.modelUsed}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
