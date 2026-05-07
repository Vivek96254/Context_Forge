import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import '@/styles/globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'KnowledgeAI - Enterprise Knowledge Assistant',
  description: 'AI-powered enterprise document search and question answering system with RAG-based retrieval, citations, and intelligent query understanding.',
  keywords: ['AI', 'Knowledge Base', 'RAG', 'Enterprise', 'Document Search', 'Question Answering'],
  authors: [{ name: 'KnowledgeAI Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f14' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <div className="min-h-screen bg-surface-primary transition-colors duration-300">
          {/* Background Pattern */}
          <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Gradient Orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
            
            {/* Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(90, 106, 255, 0.5) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(90, 106, 255, 0.5) 1px, transparent 1px)
                `,
                backgroundSize: '64px 64px',
              }}
            />
          </div>

          {/* Navbar */}
          <Navbar />

          {/* Main Content */}
          <main className="relative">
            {children}
          </main>

          {/* Footer */}
          <footer className="relative border-t border-border bg-surface-secondary/30 backdrop-blur-xl mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-sm text-text-secondary">
                    KnowledgeAI &copy; {new Date().getFullYear()}
                  </span>
                </div>
                
                <div className="flex items-center gap-6">
                  <a 
                    href="#" 
                    className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    Documentation
                  </a>
                  <a 
                    href="#" 
                    className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    API Reference
                  </a>
                  <a 
                    href="#" 
                    className="text-xs text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    Support
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
