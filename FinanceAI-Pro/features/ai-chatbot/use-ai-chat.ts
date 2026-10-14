'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  AIMessage,
  FinancialContext,
  getAIResponse,
  simulateTypingDelay,
  generateId,
  SUGGESTED_QUESTIONS,
} from '@/features/ai-chatbot/ai-engine';

const WELCOME_MESSAGE: AIMessage = {
  id: 'welcome',
  role: 'assistant',
  content: `## 👋 Welcome to FinanceAI Assistant!

I'm your personal AI financial advisor, powered by your **real transaction data**.

Here's what I can help you with:
- 📊 **Budget planning** tailored to your income
- 💰 **Savings strategies** based on your spending
- 📉 **Expense analysis** & reduction tips
- 📈 **Investment advice** for your surplus
- 🏥 **Financial health** scoring
- 🎯 **Goal setting** & retirement planning
- 🧾 **Tax saving** tips under Indian tax laws

Type your question or choose a suggestion below to get started! 🚀`,
  timestamp: new Date(),
};

export const useAIChat = (ctx: FinancialContext | null) => {
  const [messages, setMessages] = useState<AIMessage[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMessage: AIMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setIsTyping(true);

      try {
        await simulateTypingDelay();

        const defaultCtx: FinancialContext = {
          remainingAmount: 0,
          incomeAmount: 0,
          expensesAmount: 0,
          categories: [],
        };

        const responseText = getAIResponse(trimmed, ctx ?? defaultCtx);

        const assistantMessage: AIMessage = {
          id: generateId(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } finally {
        setIsTyping(false);
      }
    },
    [ctx, isTyping]
  );

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
  }, []);

  const sendSuggestion = useCallback(
    (suggestion: string) => {
      // Strip leading emoji + space for cleaner input (e.g. "📊 Budget" → "Budget")
      const clean = suggestion.replace(/^.{1,2}\s/, '');
      sendMessage(clean);
    },
    [sendMessage]
  );

  return {
    messages,
    isTyping,
    inputValue,
    setInputValue,
    sendMessage,
    sendSuggestion,
    clearChat,
    messagesEndRef,
    suggestions: SUGGESTED_QUESTIONS,
  };
};
