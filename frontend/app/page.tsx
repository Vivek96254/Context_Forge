'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  UploadIcon,
  SearchIcon,
  ChartIcon,
  ShieldIcon,
  ZapIcon,
  LayersIcon,
  BrainIcon,
  ArrowRightIcon,
} from '@/components/ui/Icons';

const features = [
  {
    icon: BrainIcon,
    title: 'RAG-Powered Search',
    description: 'Advanced retrieval-augmented generation for accurate, contextual answers from your documents.',
    gradient: 'from-brand-500 to-violet-500',
  },
  {
    icon: LayersIcon,
    title: 'Citation-Driven',
    description: 'Every answer is backed by source citations, ensuring transparency and verifiability.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: ZapIcon,
    title: 'Lightning Fast',
    description: 'Hybrid search combining semantic and keyword matching for sub-second retrieval.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: ShieldIcon,
    title: 'Enterprise Security',
    description: 'Role-based access control and secure document handling for enterprise compliance.',
    gradient: 'from-rose-500 to-pink-500',
  },
];

const stats = [
  { value: '99.9%', label: 'Uptime' },
  { value: '<500ms', label: 'Avg Response' },
  { value: '10k+', label: 'Documents' },
  { value: '256-bit', label: 'Encryption' },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-secondary border border-border mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-sm font-medium text-text-secondary">
              Enterprise-grade AI Knowledge Assistant
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6"
          >
            Your Documents,
            <br />
            <span className="text-gradient-premium">Intelligently Searchable</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10"
          >
            Transform your document repository into an intelligent knowledge base.
            Ask questions, get cited answers, and make decisions faster.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/query" className="group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-medium shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-shadow"
              >
                <SparklesIcon className="w-5 h-5" />
                Start Asking Questions
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </Link>
            
            <Link href="/upload" className="group">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-secondary border border-border text-text-primary font-medium hover:bg-surface-tertiary transition-colors"
              >
                <UploadIcon className="w-5 h-5 text-text-secondary" />
                Upload Documents
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 via-violet-500/20 to-brand-500/20 rounded-full blur-3xl animate-pulse-soft" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-12 border-y border-border bg-surface-secondary/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl sm:text-4xl font-bold text-text-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-text-tertiary">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              Enterprise-Ready Features
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Built for organizations that demand security, accuracy, and performance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-2xl bg-surface-elevated border border-border hover:border-brand-500/30 hover:shadow-premium-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-4 py-24 bg-surface-secondary/30">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
              How It Works
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Three simple steps to unlock the knowledge in your documents
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: UploadIcon,
                title: 'Upload Documents',
                description: 'Upload PDFs, Word docs, and text files. Our system automatically indexes and processes them.',
              },
              {
                step: '02',
                icon: SearchIcon,
                title: 'Ask Questions',
                description: 'Ask natural language questions about your documents. Our AI understands context and intent.',
              },
              {
                step: '03',
                icon: SparklesIcon,
                title: 'Get Cited Answers',
                description: 'Receive accurate answers with citations to source documents for full transparency.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector Line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-border via-brand-500/30 to-border" />
                )}
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-surface-elevated border border-border mb-6 relative group">
                    <item.icon className="w-10 h-10 text-brand-500" />
                    <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center shadow-lg">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-brand-500 to-violet-500 overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '24px 24px',
                }}
              />
            </div>

            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Ready to Transform Your Knowledge Base?
              </h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">
                Start asking questions and get instant, cited answers from your documents.
              </p>
              <Link href="/query">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-brand-600 font-semibold shadow-xl hover:shadow-2xl transition-shadow"
                >
                  <SparklesIcon className="w-5 h-5" />
                  Get Started Now
                  <ArrowRightIcon className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
