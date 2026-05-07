'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload as UploadIcon,
  FileText as FileIcon,
  Check as CheckIcon,
  X as CloseIcon,
  AlertCircle as AlertIcon,
  Trash2 as TrashIcon,
  RefreshCw as RefreshIcon,
  CloudUpload as CloudUploadIcon,
} from 'lucide-react';
import { uploadDocument, getDocuments, deleteDocument } from '@/lib/api';
import type { Document } from '@/types/api';

interface UploadState {
  file: File | null;
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
}

export default function UploadPage() {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    progress: 0,
    status: 'idle',
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const loadDocuments = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setUploadState({ file, progress: 0, status: 'idle' });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!uploadState.file) return;

    setUploadState(prev => ({ ...prev, status: 'uploading', progress: 0 }));

    const interval = setInterval(() => {
      setUploadState(prev => ({
        ...prev,
        progress: Math.min(prev.progress + 10, 90),
      }));
    }, 200);

    try {
      await uploadDocument(uploadState.file);
      clearInterval(interval);
      setUploadState(prev => ({ ...prev, status: 'success', progress: 100 }));
      loadDocuments();
    } catch (err) {
      clearInterval(interval);
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        error: err instanceof Error ? err.message : 'Upload failed',
      }));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const resetUpload = () => {
    setUploadState({ file: null, progress: 0, status: 'idle' });
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'processing': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'pending': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 mb-4 shadow-lg shadow-emerald-500/25">
          <UploadIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Upload Documents
        </h1>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          Upload your documents to make them searchable by the AI assistant
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-premium p-6">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Upload New Document
            </h2>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`
                relative p-8 rounded-xl border-2 border-dashed transition-all duration-200 text-center
                ${isDragging 
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' 
                  : 'border-border hover:border-brand-500/50 hover:bg-surface-secondary/50'
                }
                ${uploadState.file ? 'pb-4' : ''}
              `}
            >
              {!uploadState.file ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-secondary flex items-center justify-center">
                    <CloudUploadIcon className="w-8 h-8 text-text-tertiary" />
                  </div>
                  <p className="text-sm font-medium text-text-primary mb-1">
                    Drop your file here, or{' '}
                    <label className="text-brand-600 dark:text-brand-400 cursor-pointer hover:underline">
                      browse
                      <input
                        type="file"
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.md"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-text-tertiary">
                    PDF, DOC, DOCX, TXT, MD up to 50MB
                  </p>
                </>
              ) : (
                <div className="space-y-4">
                  {/* File Info */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary">
                    <div className="w-10 h-10 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                      <FileIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {uploadState.file.name}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        {formatFileSize(uploadState.file.size)}
                      </p>
                    </div>
                    {uploadState.status === 'idle' && (
                      <button
                        onClick={resetUpload}
                        className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors"
                      >
                        <CloseIcon className="w-4 h-4 text-text-tertiary" />
                      </button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {uploadState.status === 'uploading' && (
                    <div className="space-y-2">
                      <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadState.progress}%` }}
                          className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full"
                        />
                      </div>
                      <p className="text-xs text-text-tertiary text-center">
                        Uploading... {uploadState.progress}%
                      </p>
                    </div>
                  )}

                  {/* Success State */}
                  {uploadState.status === 'success' && (
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                      <CheckIcon className="w-5 h-5 text-emerald-500" />
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                        Upload successful!
                      </p>
                    </div>
                  )}

                  {/* Error State */}
                  {uploadState.status === 'error' && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <AlertIcon className="w-5 h-5 text-red-500" />
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {uploadState.error}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              {uploadState.file && uploadState.status === 'idle' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpload}
                  className="flex-1 btn-primary"
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Upload Document
                </motion.button>
              )}
              
              {(uploadState.status === 'success' || uploadState.status === 'error') && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetUpload}
                  className="flex-1 btn-secondary"
                >
                  <RefreshIcon className="w-4 h-4 mr-2" />
                  Upload Another
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Documents List Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-premium p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                Uploaded Documents
              </h2>
              <button
                onClick={loadDocuments}
                disabled={isLoadingDocs}
                className="btn-ghost text-sm"
              >
                <RefreshIcon className={`w-4 h-4 mr-1 ${isLoadingDocs ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-secondary flex items-center justify-center">
                  <FileIcon className="w-8 h-8 text-text-tertiary" />
                </div>
                <p className="text-sm text-text-secondary mb-1">No documents yet</p>
                <p className="text-xs text-text-tertiary">
                  Upload your first document to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {documents.map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary/50 hover:bg-surface-secondary transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-surface-tertiary flex items-center justify-center flex-shrink-0">
                        <FileIcon className="w-5 h-5 text-text-tertiary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {doc.filename}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-text-tertiary">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span className={`px-1.5 py-0.5 rounded ${getStatusColor(doc.status)}`}>
                            {doc.status}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                      >
                        <TrashIcon className="w-4 h-4 text-red-500" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
