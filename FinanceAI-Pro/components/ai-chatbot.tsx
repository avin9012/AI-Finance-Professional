'use client';

import React, { useState, useRef, useEffect, KeyboardEvent, FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useGetSummary } from '@/features/summary/api/use-get-summary';
import { useAIChat } from '@/features/ai-chatbot/use-ai-chat';
import { FinancialContext } from '@/features/ai-chatbot/ai-engine';
import {
  Bot,
  X,
  Send,
  Trash2,
  ChevronDown,
  Sparkles,
  User,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ────────────────────────────────────────────────────────────
// Helper: format timestamp
// ────────────────────────────────────────────────────────────
const formatTime = (date: Date): string =>
  date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

// ────────────────────────────────────────────────────────────
// Typing dots indicator
// ────────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="flex items-end gap-2 mb-4">
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="bg-white border border-blue-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1">
        <span className="ai-dot" style={{ animationDelay: '0ms' }} />
        <span className="ai-dot" style={{ animationDelay: '200ms' }} />
        <span className="ai-dot" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────
// Individual chat message bubble
// ────────────────────────────────────────────────────────────
interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MessageBubble = ({ role, content, timestamp }: MessageBubbleProps) => {
  const isUser = role === 'user';

  return (
    <div className={cn('flex items-end gap-2 mb-4', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md',
          isUser
            ? 'bg-gradient-to-br from-emerald-400 to-teal-600'
            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          'max-w-[85%] px-4 py-3 shadow-sm',
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-sm'
            : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-sm'
        )}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{content}</p>
        ) : (
          <div className="ai-markdown text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => (
                  <h2 className="text-base font-bold text-gray-900 mb-2 mt-1 flex items-center gap-1">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-sm font-semibold text-blue-700 mb-1 mt-2">{children}</h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-sm font-semibold text-gray-700 mb-1 mt-2">{children}</h4>
                ),
                p: ({ children }) => (
                  <p className="text-gray-700 mb-1 leading-relaxed">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-none space-y-1 mb-2 pl-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 space-y-1 mb-2 text-gray-700">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-gray-700 flex items-start gap-1">
                    <span className="mt-0.5 text-blue-400">•</span>
                    <span>{children}</span>
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-gray-900">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-gray-600">{children}</em>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2 rounded-lg border border-gray-200">
                    <table className="w-full text-xs">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="bg-blue-50">{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="px-3 py-2 text-left font-semibold text-blue-700 border-b border-blue-100">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-3 py-2 text-gray-700 border-b border-gray-50">{children}</td>
                ),
                tr: ({ children }) => (
                  <tr className="hover:bg-gray-50 transition-colors">{children}</tr>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-3 border-blue-400 bg-blue-50 px-3 py-2 rounded-r-lg my-2 text-gray-700 text-xs italic">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="bg-gray-100 text-blue-700 px-1 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                ),
                hr: () => <hr className="my-2 border-gray-200" />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
        <p
          className={cn(
            'text-xs mt-1',
            isUser ? 'text-blue-200 text-right' : 'text-gray-400'
          )}
        >
          {formatTime(timestamp)}
        </p>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// Suggestion pill button
// ────────────────────────────────────────────────────────────
interface SuggestionPillProps {
  text: string;
  onClick: () => void;
}

const SuggestionPill = ({ text, onClick }: SuggestionPillProps) => (
  <button
    onClick={onClick}
    className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 font-medium shadow-sm hover:shadow-md active:scale-95"
  >
    {text}
  </button>
);

// ────────────────────────────────────────────────────────────
// Main Chatbot Component
// ────────────────────────────────────────────────────────────
const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const { data: summary } = useGetSummary();

  const financialCtx: FinancialContext | null = summary
    ? {
        remainingAmount: summary.remainingAmount ?? 0,
        incomeAmount: summary.incomeAmount ?? 0,
        expensesAmount: summary.expensesAmount ?? 0,
        categories: (summary.categories ?? []).map((c: any) => ({
          name: c.name,
          value: c.value,
        })),
      }
    : null;

  const {
    messages,
    isTyping,
    inputValue,
    setInputValue,
    sendMessage,
    sendSuggestion,
    clearChat,
    messagesEndRef,
    suggestions,
  } = useAIChat(financialCtx);

  // Notify user of new messages when closed
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setHasNewMessage(true);
    }
  }, [messages.length, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewMessage(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // Auto-resize textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 100)}px`;
  }, [inputValue]);

  return (
    <>
      {/* ── CSS for dots & chat ───────────────── */}
      <style>{`
        .ai-dot {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          animation: aiBounce 1.2s ease-in-out infinite;
        }
        @keyframes aiBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        .ai-chat-panel {
          animation: aiSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-origin: bottom right;
        }
        @keyframes aiSlideUp {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .ai-fab-pulse::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: rgba(99, 102, 241, 0.4);
          animation: fabPulse 2s ease-out infinite;
        }
        @keyframes fabPulse {
          0%   { transform: scale(1); opacity: 0.8; }
          70%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .ai-markdown blockquote p { margin: 0; }
        .ai-markdown ul li { list-style: none; }
        .border-l-3 { border-left-width: 3px; }
        .messages-scroll::-webkit-scrollbar { width: 4px; }
        .messages-scroll::-webkit-scrollbar-track { background: transparent; }
        .messages-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
        .suggestions-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── FAB Button ───────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <button
            id="ai-chatbot-fab"
            onClick={handleOpen}
            className="ai-fab-pulse relative w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white shadow-2xl hover:shadow-indigo-500/50 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
            aria-label="Open AI Financial Assistant"
          >
            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            {hasNewMessage && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white animate-bounce" />
            )}
          </button>
        )}
      </div>

      {/* ── Chat Panel ───────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 ai-chat-panel flex flex-col w-[380px] sm:w-[420px] h-[600px] max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                  <Bot className="w-5 h-5 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-indigo-700" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm leading-none">FinanceAI Assistant</h3>
                  <p className="text-blue-200 text-xs mt-0.5">
                    {isTyping ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Analysing...
                      </span>
                    ) : (
                      '● Online · Powered by your data'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/15 transition-colors"
                  title="Clear chat"
                  aria-label="Clear chat history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/15 transition-colors"
                  aria-label="Close chatbot"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Financial context pill */}
            {financialCtx && (
              <div className="mt-2 flex items-center gap-2 text-xs text-blue-100 bg-white/10 rounded-lg px-3 py-1.5">
                <Sparkles className="w-3 h-3 text-yellow-300 flex-shrink-0" />
                <span>
                  Bal:{' '}
                  <strong className="text-white">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    }).format(financialCtx.remainingAmount)}
                  </strong>
                  {' · '}Income:{' '}
                  <strong className="text-white">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    }).format(financialCtx.incomeAmount)}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto messages-scroll bg-gradient-to-b from-slate-50 to-blue-50/30 px-4 py-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="flex-shrink-0 bg-white border-t border-gray-100">
            <div className="px-3 pt-2 pb-1 overflow-x-auto suggestions-scroll">
              <div className="flex gap-2">
                {suggestions.map((s) => (
                  <SuggestionPill
                    key={s}
                    text={s}
                    onClick={() => sendSuggestion(s)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="flex-shrink-0 bg-white border-t border-gray-100 px-3 py-3">
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 bg-gray-50 rounded-xl border border-gray-200 pr-2 pl-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all"
            >
              <textarea
                ref={textareaRef}
                id="ai-chat-input"
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your finances…"
                disabled={isTyping}
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none leading-relaxed max-h-[100px] disabled:opacity-50"
                aria-label="Chat message input"
              />
              <button
                type="submit"
                id="ai-chat-send-btn"
                disabled={!inputValue.trim() || isTyping}
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
                  inputValue.trim() && !isTyping
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-indigo-300 hover:scale-105 active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                )}
                aria-label="Send message"
              >
                {isTyping ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-1.5">
              Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 text-xs font-mono">Enter</kbd> to send · <kbd className="px-1 py-0.5 bg-gray-100 rounded text-gray-500 text-xs font-mono">Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
