import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Neo4jProvider } from '@/core/contexts/neo4j-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NOETHER - AI-Powered Code Editor',
  description: 'An AI-powered code editor and learning system that helps you understand and visualize code relationships through dynamic knowledge graphs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Neo4jProvider>
          {children}
        </Neo4jProvider>
      </body>
    </html>
  );
} 