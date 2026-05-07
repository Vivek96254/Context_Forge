'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  UploadIcon,
  SparklesIcon,
  ChartIcon,
  MenuIcon,
  CloseIcon,
  MoonIcon,
  SunIcon,
} from '@/components/ui/Icons';

const links = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/upload', label: 'Upload', icon: UploadIcon },
  { href: '/query', label: 'Ask AI', icon: SparklesIcon },
  { href: '/metrics', label: 'Metrics', icon: ChartIcon },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  return (
    <>
      <nav
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isScrolled 
            ? 'bg-surface-primary/80 backdrop-blur-xl border-b border-border shadow-sm' 
            : 'bg-transparent'
          }
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-shadow">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-text-primary">
                  Knowledge<span className="text-brand-600 dark:text-brand-400">AI</span>
                </h1>
                <p className="text-2xs text-text-tertiary -mt-0.5">Enterprise Assistant</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`
                      relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      flex items-center gap-2 group
                      ${isActive
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-text-secondary hover:text-text-primary'
                      }
                    `}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 bg-brand-100 dark:bg-brand-900/30 rounded-xl"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="relative flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-text-tertiary group-hover:text-text-secondary'}`} />
                      {link.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl bg-surface-secondary hover:bg-surface-tertiary transition-colors"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <AnimatePresence mode="wait">
                  {isDarkMode ? (
                    <motion.div
                      key="sun"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SunIcon className="w-4 h-4 text-amber-500" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="moon"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <MoonIcon className="w-4 h-4 text-text-secondary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl bg-surface-secondary hover:bg-surface-tertiary transition-colors"
              >
                {isMobileMenuOpen ? (
                  <CloseIcon className="w-5 h-5 text-text-secondary" />
                ) : (
                  <MenuIcon className="w-5 h-5 text-text-secondary" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-surface-primary/95 backdrop-blur-xl border-b border-border"
            >
              <div className="px-4 py-4 space-y-2">
                {links.map((link, index) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                          ${isActive
                            ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
                            : 'text-text-secondary hover:bg-surface-secondary hover:text-text-primary'
                          }
                        `}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-brand-500' : 'text-text-tertiary'}`} />
                        <span className="font-medium">{link.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
