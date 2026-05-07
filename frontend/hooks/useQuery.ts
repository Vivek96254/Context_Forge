import { useState, useCallback } from 'react';
import { queryDocuments as queryDocumentsApi } from '@/lib/api';
import type { QueryRequest, QueryResponse } from '@/types/api';

export const useQuery = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<QueryResponse | null>(null);

  const query = useCallback(async (request: QueryRequest) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await queryDocumentsApi(request);
      setResponse(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process query';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return {
    query,
    loading,
    error,
    response,
    reset,
  };
};
