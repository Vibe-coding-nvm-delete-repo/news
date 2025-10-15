"use client";

import { useState } from "react";
import dynamic from 'next/dynamic';

const SettingsTab = dynamic(() => import("@/components/SettingsTab"), {
  ssr: false,
});

const NewsTab = dynamic(() => import("@/components/NewsTab"), {
  ssr: false,
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<"settings" | "news">("settings");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            News Report Generator
          </h1>
          <p className="text-slate-600">
            AI-powered news aggregation and analysis
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "settings"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("news")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "news"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            News
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === "settings" && <SettingsTab />}
          {activeTab === "news" && <NewsTab />}
        </div>
      </div>
    </main>
  );
}
