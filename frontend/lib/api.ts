import axios, { AxiosError } from 'axios';
import { config } from './config';
import type { Document, QueryRequest, QueryResponse, MetricsResponse } from '@/types/api';

const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.data) {
      const errorData = error.response.data as any;
      throw new Error(errorData.detail || 'An error occurred');
    }
    throw new Error(error.message || 'Network error');
  }
);

export const uploadDocument = async (file: File): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post<Document>(
    `${config.apiBaseUrl}/documents/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

export const getDocuments = async (): Promise<Document[]> => {
  const response = await api.get<Document[]>('/documents/');
  return response.data;
};

export const getDocument = async (id: number): Promise<Document> => {
  const response = await api.get<Document>(`/documents/${id}`);
  return response.data;
};

export const deleteDocument = async (id: number): Promise<void> => {
  await api.delete(`/documents/${id}`);
};

export const queryDocuments = async (request: QueryRequest): Promise<QueryResponse> => {
  const response = await api.post<QueryResponse>('/query/', request);
  return response.data;
};

export const getMetrics = async (windowHours: number = 24): Promise<MetricsResponse> => {
  const response = await api.get<MetricsResponse>('/metrics/', {
    params: { window_hours: windowHours },
  });
  return response.data;
};
