'use client';

import { Conversation } from '@/core/types';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  debugMode: boolean;
  onToggleDebug: () => void;
}

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  debugMode,
  onToggleDebug,
}: SidebarProps) {
  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
          Nour AI Hub
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Your Intelligent Assistant
        </p>
      </div>

      <div className="p-3">
        <button
          onClick={onNew}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full text-left rounded-lg px-3 py-2 text-sm truncate transition-colors ${
              activeId === conv.id
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {conv.title || 'New conversation'}
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={debugMode}
            onChange={onToggleDebug}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Debug Mode
        </label>
      </div>
    </div>
  );
}
