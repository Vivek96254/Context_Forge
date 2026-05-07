'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { CopyIcon, CheckIcon } from '@/components/ui/Icons';
import { useState } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const processedContent = useMemo(() => {
    return detectAndFormatSections(content);
  }, [content]);

  return (
    <div className={`prose-premium ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-text-primary mt-8 mb-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-text-primary mt-6 mb-3 pb-2 border-b border-border-subtle">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold text-text-primary mt-5 mb-2">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold text-text-primary mt-4 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-text-secondary leading-relaxed mb-4 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-none space-y-2 mb-4 pl-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-4 pl-0 marker:text-brand-500 marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => {
            const isOrdered = (props as any).ordered;
            return (
              <li className="flex items-start gap-2 text-text-secondary">
                {!isOrdered && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                )}
                <span className="flex-1">{children}</span>
              </li>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-brand-500 pl-4 py-2 my-4 bg-surface-secondary/50 rounded-r-lg italic text-text-secondary">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 dark:text-brand-400 hover:underline font-medium"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-text-primary">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-text-secondary">{children}</em>
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-surface-tertiary text-brand-600 dark:text-brand-400 font-mono text-sm">
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />
            );
          },
          pre: ({ children }) => <>{children}</>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-border">
              <table className="min-w-full divide-y divide-border">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-surface-secondary">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border bg-surface-elevated">{children}</tbody>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-xs font-semibold text-text-primary uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-text-secondary">{children}</td>
          ),
          hr: () => <hr className="my-6 border-border" />,
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="rounded-xl my-4 max-w-full h-auto shadow-premium-md"
            />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

interface CodeBlockProps {
  language: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-tertiary border-b border-border">
        <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
        >
          {copied ? (
            <>
              <CheckIcon className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500">Copied</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1rem',
          background: 'rgb(var(--surface-tertiary))',
          fontSize: '0.875rem',
        }}
        showLineNumbers
        lineNumberStyle={{
          minWidth: '2.5em',
          paddingRight: '1em',
          color: 'rgb(var(--text-tertiary))',
          userSelect: 'none',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function detectAndFormatSections(content: string): string {
  const sectionKeywords = [
    { keyword: 'overview', heading: '## Overview' },
    { keyword: 'introduction', heading: '## Introduction' },
    { keyword: 'architecture', heading: '## Architecture' },
    { keyword: 'features', heading: '## Features' },
    { keyword: 'benefits', heading: '## Benefits' },
    { keyword: 'limitations', heading: '## Limitations' },
    { keyword: 'drawbacks', heading: '## Drawbacks' },
    { keyword: 'security', heading: '## Security' },
    { keyword: 'performance', heading: '## Performance' },
    { keyword: 'implementation', heading: '## Implementation' },
    { keyword: 'configuration', heading: '## Configuration' },
    { keyword: 'usage', heading: '## Usage' },
    { keyword: 'example', heading: '## Example' },
    { keyword: 'conclusion', heading: '## Conclusion' },
    { keyword: 'summary', heading: '## Summary' },
    { keyword: 'references', heading: '## References' },
    { keyword: 'requirements', heading: '## Requirements' },
    { keyword: 'prerequisites', heading: '## Prerequisites' },
    { keyword: 'installation', heading: '## Installation' },
    { keyword: 'getting started', heading: '## Getting Started' },
    { keyword: 'how it works', heading: '## How It Works' },
    { keyword: 'key points', heading: '## Key Points' },
    { keyword: 'main components', heading: '## Main Components' },
  ];

  let processedContent = content;

  if (!content.includes('#')) {
    sectionKeywords.forEach(({ keyword, heading }) => {
      const regex = new RegExp(`(?:^|\\n)\\s*(?:${keyword}[:\\s]*)(\\n|$)`, 'gi');
      processedContent = processedContent.replace(regex, `\n\n${heading}\n\n`);
    });

    const numberedListRegex = /(\d+\.\s+[A-Z][^:]+:)/g;
    processedContent = processedContent.replace(numberedListRegex, '\n### $1\n');
  }

  return processedContent;
}
