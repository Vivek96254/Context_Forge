import { useState, useCallback } from 'react';
import { uploadDocument as uploadDocumentApi } from '@/lib/api';
import type { Document } from '@/types/api';

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedDocument, setUploadedDocument] = useState<Document | null>(null);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    setUploadedDocument(null);

    try {
      const document = await uploadDocumentApi(file);
      setUploadedDocument(document);
      return document;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload document';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setUploadedDocument(null);
    setError(null);
  }, []);

  return {
    upload,
    uploading,
    error,
    uploadedDocument,
    reset,
  };
};
