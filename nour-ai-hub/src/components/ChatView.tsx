'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import Sidebar from './Sidebar';
import type { ChatMessage as ChatMessageType, Conversation } from '@/core/types';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default function ChatView() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId) || null;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConv?.messages.length, scrollToBottom]);

  useEffect(() => {
    const saved = localStorage.getItem('nour-conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveConvId(parsed[0].id);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('nour-conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  const createNewChat = useCallback(() => {
    const newConv: Conversation = {
      id: generateId(),
      title: 'New conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newConv.id);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      let convId = activeConvId;

      if (!convId) {
        const newConv: Conversation = {
          id: generateId(),
          title: content.substring(0, 50),
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setConversations((prev) => [newConv, ...prev]);
        convId = newConv.id;
        setActiveConvId(convId);
      }

      const userMessage: ChatMessageType = {
        id: generateId(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          const title = c.messages.length === 0 ? content.substring(0, 50) : c.title;
          return {
            ...c,
            title,
            messages: [...c.messages, userMessage],
            updatedAt: Date.now(),
          };
        })
      );

      setIsLoading(true);

      try {
        const currentConv = conversations.find((c) => c.id === convId);
        const history = currentConv?.messages || [];

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            conversationHistory: [...history, userMessage],
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to get response');
        }

        const assistantMessage: ChatMessageType = {
          id: generateId(),
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
          debug: data.debug,
        };

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== convId) return c;
            return {
              ...c,
              messages: [...c.messages, assistantMessage],
              updatedAt: Date.now(),
            };
          })
        );
      } catch (error) {
        const errorMessage: ChatMessageType = {
          id: generateId(),
          role: 'assistant',
          content: `Sorry, an error occurred: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
          timestamp: Date.now(),
        };

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== convId) return c;
            return { ...c, messages: [...c.messages, errorMessage], updatedAt: Date.now() };
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeConvId, conversations]
  );

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950">
      {sidebarOpen && (
        <Sidebar
          conversations={conversations}
          activeId={activeConvId}
          onSelect={setActiveConvId}
          onNew={createNewChat}
          debugMode={debugMode}
          onToggleDebug={() => setDebugMode((d) => !d)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {activeConv?.title || 'Nour AI Hub'}
            </h2>
            {isLoading && (
              <p className="text-xs text-indigo-500">Thinking...</p>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-3xl mx-auto">
            {(!activeConv || activeConv.messages.length === 0) && (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">
                  <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent font-bold text-3xl">
                    Nour AI Hub
                  </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                  Your intelligent assistant for teaching, research, content creation,
                  design, video production, and more. Just ask anything.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3 max-w-lg mx-auto">
                  {[
                    'Explain SN1 and SN2 reactions',
                    'Create an Instagram campaign for my chemistry course',
                    'Help me plan a chemistry club launch',
                    'Write an email to my department',
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="text-left p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeConv?.messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} debugMode={debugMode} />
            ))}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
