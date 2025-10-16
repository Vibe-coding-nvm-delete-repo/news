'use client';

import { CheckCircle2, Loader2, XCircle, Circle } from 'lucide-react';
import { SystemLogicStep, SystemLogicStepStatus } from '@/lib/systemLogic';

const statusIcon = (status: SystemLogicStepStatus) => {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'in-progress':
      return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
    default:
      return <Circle className="h-4 w-4 text-slate-400" />;
  }
};

const statusBadgeStyles: Record<SystemLogicStepStatus, string> = {
  success: 'bg-green-100 text-green-700 border border-green-200 font-medium',
  error: 'bg-red-100 text-red-700 border border-red-200 font-medium',
  'in-progress':
    'bg-blue-100 text-blue-700 border border-blue-200 font-medium animate-pulse',
  pending: 'bg-slate-100 text-slate-500 border border-slate-200',
};

interface SystemLogicStepsProps {
  keyword: string;
  steps: SystemLogicStep[];
}

export default function SystemLogicSteps({
  keyword,
  steps,
}: SystemLogicStepsProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-indigo-600" />
          System Logic Trace
        </h4>
        <p className="text-xs text-slate-500 mt-1">
          Keyword: <span className="font-mono">{keyword}</span>
        </p>
      </div>
      <ol className="px-4 py-3 space-y-3">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-start gap-3">
            <div className="mt-0.5">{statusIcon(step.status)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {index + 1}. {step.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {step.description}
                  </p>
                  {step.detail && (
                    <p className="text-xs text-slate-600 mt-2 whitespace-pre-wrap break-words">
                      {step.detail}
                    </p>
                  )}
                </div>
                <span
                  className={`text-[10px] uppercase tracking-wide px-2 py-1 rounded ${statusBadgeStyles[step.status]}`}
                >
                  {step.status.replace('-', ' ')}
                </span>
              </div>
              {(step.elapsedMs !== undefined ||
                step.startedAt !== undefined) && (
                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                  {step.startedAt && (
                    <span>
                      Start:{' '}
                      {new Date(step.startedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  )}
                  {step.endedAt && (
                    <span>
                      End:{' '}
                      {new Date(step.endedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  )}
                  {step.elapsedMs !== undefined && (
                    <span>Δt: {(step.elapsedMs / 1000).toFixed(2)}s</span>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
