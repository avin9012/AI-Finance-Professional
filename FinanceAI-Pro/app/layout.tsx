import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import React from 'react';

import { Toaster } from '@/components/ui/sonner';
import { QueryProvider } from '@/providers/query-provider';
import { SheetProvider } from '@/providers/sheet-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FinanceAI Pro — Your Personal Finance Manager',
  description: 'AI-powered financial advisor for budget planning, expense tracking, and investment strategies.',
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
      <body className={inter.className}>
      <QueryProvider>
        <SheetProvider />
        <Toaster />
        {children}
      </QueryProvider>
      </body>
      </html>
    </ClerkProvider>
  );
}
