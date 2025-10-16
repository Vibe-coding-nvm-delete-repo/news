'use client';

import { Filter } from 'lucide-react';

export type DateFilterOption = 'all' | 'today' | 'last7days' | 'last30days';

interface DateFilterDropdownProps {
  value: DateFilterOption;
  onChange: (value: DateFilterOption) => void;
}

export default function DateFilterDropdown({
  value,
  onChange,
}: DateFilterDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-slate-500" />
      <select
        value={value}
        onChange={e => onChange(e.target.value as DateFilterOption)}
        className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="last7days">Last 7 Days</option>
        <option value="last30days">Last 30 Days</option>
      </select>
    </div>
  );
}
