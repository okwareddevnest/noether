import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NOETHER - AI-Powered Code Editor',
  description: 'An intelligent code editor with integrated knowledge graph and personalized learning paths.',
  keywords: ['code editor', 'AI', 'knowledge graph', 'learning', 'programming'],
  authors: [{ name: 'Your Name' }],
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <div className="flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
} 