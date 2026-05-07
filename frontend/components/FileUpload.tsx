'use client';

import { useState, useRef } from 'react';
import { useUpload } from '@/hooks/useUpload';

const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md']
};

const ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.md'];

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload, uploading, error, uploadedDocument, reset } = useUpload();

  const isFileTypeAllowed = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return ALLOWED_EXTENSIONS.includes(extension);
  };

  const getFileTypeLabel = (filename: string): string => {
    const extension = '.' + filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case '.pdf': return 'PDF Document';
      case '.txt': return 'Text File';
      case '.md': return 'Markdown File';
      default: return 'Unknown';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isFileTypeAllowed(file)) {
        alert('Only PDF, TXT, and MD files are supported');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      setSelectedFile(file);
      reset();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await upload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Upload Document</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select File (PDF, TXT, or MD)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Supported formats: PDF documents, plain text files (.txt), and Markdown files (.md)
          </p>
        </div>

        {selectedFile && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Selected:</span> {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Type: {getFileTypeLabel(selectedFile.name)} • Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          {(selectedFile || uploadedDocument || error) && (
            <button
              onClick={handleReset}
              disabled={uploading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {uploading && (
          <div className="mt-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="text-gray-700 dark:text-gray-300">Processing upload...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">Upload Failed</h3>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {uploadedDocument && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">Upload Successful</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Document ID:</span>
                <span className="font-mono text-gray-900 dark:text-white">{uploadedDocument.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Filename:</span>
                <span className="font-medium text-gray-900 dark:text-white">{uploadedDocument.filename}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="text-gray-900 dark:text-white">
                  {uploadedDocument.mime_type === 'application/pdf' && 'PDF Document'}
                  {uploadedDocument.mime_type === 'text/plain' && 'Text File'}
                  {uploadedDocument.mime_type === 'text/markdown' && 'Markdown File'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    uploadedDocument.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : uploadedDocument.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                      : uploadedDocument.status === 'failed'
                      ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                  }`}
                >
                  {uploadedDocument.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Size:</span>
                <span className="text-gray-900 dark:text-white">
                  {(uploadedDocument.file_size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>
            {uploadedDocument.status === 'pending' && (
              <p className="mt-3 text-xs text-gray-600 dark:text-gray-400 italic">
                Document is queued for processing. Check back later or refresh to see updated status.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
