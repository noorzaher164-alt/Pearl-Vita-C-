'use client';

import { ChatMessage as ChatMessageType } from '@/core/types';

interface ChatMessageProps {
  message: ChatMessageType;
  debugMode: boolean;
}

export default function ChatMessage({ message, debugMode }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-indigo-600 text-white rounded-br-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
          }`}
        >
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
        </div>

        {debugMode && message.debug?.routing && (
          <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-xs">
            <div className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
              Debug Info
            </div>
            <div className="space-y-1 text-yellow-700 dark:text-yellow-300">
              <div>
                <span className="font-medium">Agents:</span>{' '}
                {message.debug.routing.agents.join(', ')}
              </div>
              <div>
                <span className="font-medium">Confidence:</span>{' '}
                {(message.debug.routing.confidence * 100).toFixed(0)}%
              </div>
              <div>
                <span className="font-medium">Reasoning:</span>{' '}
                {message.debug.routing.reasoning}
              </div>
              <div>
                <span className="font-medium">Multi-agent:</span>{' '}
                {message.debug.routing.isMultiAgent ? 'Yes' : 'No'}
              </div>
            </div>
            {message.debug.agentResponses && message.debug.agentResponses.length > 1 && (
              <div className="mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-800">
                <div className="font-medium mb-1">Agent Responses:</div>
                {message.debug.agentResponses.map((r, i) => (
                  <div key={i} className="ml-2 mb-1">
                    <span className="font-medium">{r.agent}:</span>{' '}
                    {typeof r === 'object' && 'contentPreview' in r
                      ? (r as { contentPreview: string }).contentPreview
                      : r.content?.substring(0, 100) + '...'}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={`text-xs mt-1 ${isUser ? 'text-right' : 'text-left'} text-gray-400`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
