/**
 * Main application page component.
 *
 * This is the root page of the News Report Generator application.
 * It provides a tabbed interface to switch between Settings and News views.
 *
 * Components are dynamically loaded to prevent SSR hydration issues with Zustand persist.
 *
 * @component
 */
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import tabs to prevent SSR hydration issues with Zustand persist
const SettingsTab = dynamic(() => import('@/components/SettingsTab'), {
  ssr: false,
});

const NewsTab = dynamic(() => import('@/components/NewsTab'), {
  ssr: false,
});

// Import PolicyViewer
const PolicyViewer = dynamic(() => import('@/components/PolicyViewer'), {
  ssr: false,
});

/**
 * Home page component with tabbed navigation.
 * Manages tab state and renders the appropriate child component.
 */
export default function Home() {
  const [activeTab, setActiveTab] = useState<'settings' | 'news' | 'policy'>(
    'settings'
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            NewsForge AI
          </h1>
          <p className="text-slate-600">
            AI-powered news aggregation and intelligent reporting
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'settings'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'news'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            News
          </button>
          <button
            onClick={() => setActiveTab('policy')}
            className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'policy'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🤖 Agent Policy
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'policy' ? (
          <PolicyViewer />
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {activeTab === 'settings' && <SettingsTab />}
            {activeTab === 'news' && <NewsTab />}
          </div>
        )}
      </div>
    </main>
  );
}
