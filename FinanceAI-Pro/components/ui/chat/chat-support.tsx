"use client";

import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import {
  ExpandableChat,
  ExpandableChatBody,
  ExpandableChatFooter,
  ExpandableChatHeader,
} from "@/components/ui/chat/expandable-chat";
import { MessageCirclePlus, Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, KeyboardEvent, FormEvent } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeDisplayBlock from "./code-display-block";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import {
  getAIResponse,
  simulateTypingDelay,
  generateId,
  SUGGESTED_QUESTIONS,
  FinancialContext,
  AIMessage,
} from "@/features/ai-chatbot/ai-engine";

// ── Welcome message shown on first load ──────────────────────
const INITIAL_MESSAGES: AIMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: `## 👋 Welcome to FinanceAI Assistant!

I'm your **personal AI financial advisor**, powered by your real transaction data. Here's how I can help:

- 📊 **Budget planning** tailored to your income
- 💰 **Savings strategies** based on your spending
- 📉 **Expense reduction** tips & analysis
- 📈 **Investment advice** for your surplus
- 🏥 **Financial health** scoring & reports
- 🎯 **Goal setting** & retirement planning
- 🧾 **Tax saving** tips

Type a question or tap a suggestion below to get started! 🚀`,
    timestamp: new Date(),
  },
];

// ── Suggestion pills ──────────────────────────────────────────
const QUICK_REPLIES = [
  "📊 Budget my salary",
  "💰 Savings strategies",
  "📉 Reduce expenses",
  "📈 Investment advice",
  "🏥 Financial health",
  "🎯 Set financial goals",
  "🧾 Save on taxes",
];

export default function ChatSupport() {
  const [messages, setMessages] = useState<AIMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { data: summary } = useGetSummary();

  // Build financial context from real data
  const financialCtx: FinancialContext = {
    remainingAmount: summary?.remainingAmount ?? 0,
    incomeAmount: summary?.incomeAmount ?? 0,
    expensesAmount: summary?.expensesAmount ?? 0,
    categories: (summary?.categories ?? []).map((c: any) => ({
      name: c.name,
      value: c.value,
    })),
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  // ── Send a message ──────────────────────────────────────────
  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating) return;

    const userMsg: AIMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsGenerating(true);

    try {
      // Simulate AI "thinking" delay
      await simulateTypingDelay();

      const aiText = getAIResponse(trimmed, financialCtx);

      const aiMsg: AIMessage = {
        id: generateId(),
        role: "assistant",
        content: aiText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSend(input);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const clearChat = () => setMessages(INITIAL_MESSAGES);

  return (
    <ExpandableChat size="md" position="bottom-right">
      {/* ── Header ──────────────────────────────── */}
      <ExpandableChatHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 flex-col text-center justify-center py-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          <h1 className="text-lg font-bold text-white">FinanceAI Assistant</h1>
        </div>
        <p className="text-blue-100 text-xs mb-3">
          Powered by your real financial data · No API key required
        </p>
        {summary && (
          <div className="flex items-center justify-center gap-3 text-xs bg-white/10 rounded-full px-4 py-1.5 mb-3">
            <span className="text-blue-100">
              Balance:{" "}
              <strong className="text-white">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(financialCtx.remainingAmount)}
              </strong>
            </span>
            <span className="text-blue-300">·</span>
            <span className="text-blue-100">
              Income:{" "}
              <strong className="text-white">
                {new Intl.NumberFormat("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }).format(financialCtx.incomeAmount)}
              </strong>
            </span>
          </div>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="bg-white/15 border border-white/30 text-white hover:bg-white/25 text-xs"
          onClick={clearChat}
        >
          <MessageCirclePlus size={14} className="mr-1.5" />
          New Chat
        </Button>
      </ExpandableChatHeader>

      {/* ── Messages ────────────────────────────── */}
      <ExpandableChatBody>
        <ChatMessageList className="bg-gradient-to-b from-slate-50 to-blue-50/30" ref={messagesRef}>
          {messages.map((message) => (
            <ChatBubble
              key={message.id}
              variant={message.role === "user" ? "sent" : "received"}
            >
              <ChatBubbleAvatar
                src=""
                fallback={message.role === "user" ? "👤" : "🤖"}
              />
              <ChatBubbleMessage
                variant={message.role === "user" ? "sent" : "received"}
              >
                {message.content.split("```").map((part: string, index: number) => {
                  if (index % 2 === 0) {
                    return (
                      <Markdown key={index} remarkPlugins={[remarkGfm]}>
                        {part}
                      </Markdown>
                    );
                  } else {
                    return (
                      <pre className="pt-2" key={index}>
                        <CodeDisplayBlock code={part} lang="" />
                      </pre>
                    );
                  }
                })}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}

          {/* Typing indicator */}
          {isGenerating && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar src="" fallback="🤖" />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </ExpandableChatBody>

      {/* ── Quick Reply Suggestions ──────────────── */}
      <div className="px-3 py-2 bg-white border-t border-gray-100 overflow-x-auto">
        <div className="flex gap-2" style={{ width: "max-content" }}>
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              onClick={() => handleSend(q)}
              disabled={isGenerating}
              className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input Footer ────────────────────────── */}
      <ExpandableChatFooter className="bg-white border-t border-gray-100">
        <form ref={formRef} className="flex relative gap-2" onSubmit={onSubmit}>
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="min-h-12 bg-gray-50 shadow-none border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="Ask about your finances…"
            disabled={isGenerating}
          />
          <Button
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md"
            type="submit"
            size="icon"
            disabled={isGenerating || !input.trim()}
          >
            <Send className="size-4" />
          </Button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-1 mb-1">
          No AI API key needed · Powered by your transaction data
        </p>
      </ExpandableChatFooter>
    </ExpandableChat>
  );
}