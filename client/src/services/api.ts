import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const { refreshAuth, refreshToken } = useAuthStore.getState();
        
        if (refreshToken) {
          await refreshAuth();
          // Retry the original request with new token
          const { token } = useAuthStore.getState();
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } else {
          // No refresh token available, clear auth
          // DON'T redirect here - let React Router handle it
          const { clearAuth } = useAuthStore.getState();
          clearAuth();
          throw error; // Throw error to let the calling code handle it
        }
      } catch (refreshError) {
        // Refresh failed, clear auth
        // DON'T redirect here - let React Router handle it
        const { clearAuth } = useAuthStore.getState();
        clearAuth();
        return Promise.reject(refreshError);
      }
    }

    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          toast.error(data.message || 'Bad request');
          break;
        case 403:
          toast.error('Access denied');
          break;
        case 404:
          toast.error('Resource not found');
          break;
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          // Don't show toast for 401 errors - they're handled by the interceptor
          if (status !== 401) {
            toast.error(data.message || 'An error occurred');
          }
      }
      
      console.error(`❌ API Error: ${status}`, data);
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
      console.error('❌ Network Error:', error.request);
    } else {
      // Other error
      toast.error('An unexpected error occurred');
      console.error('❌ Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Generic API methods
export class ApiService {
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  static async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  static async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  static async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    return response.data.data;
  }

  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data.data;
  }

  // Paginated requests
  static async getPaginated<T>(
    url: string, 
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const response = await apiClient.get<PaginatedResponse<T>>(url, { params });
    return response.data;
  }

  // File upload
  static async uploadFile<T>(
    url: string, 
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    };

    const response = await apiClient.post<ApiResponse<T>>(url, formData, config);
    return response.data.data;
  }

  // Batch requests
  static async batch<T>(requests: Array<() => Promise<any>>): Promise<T[]> {
    const responses = await Promise.allSettled(requests.map(req => req()));
    
    return responses.map((response, index) => {
      if (response.status === 'fulfilled') {
        return response.value;
      } else {
        console.error(`Batch request ${index} failed:`, response.reason);
        throw response.reason;
      }
    });
  }
}

// Request/Response logging utility
export const logApiCall = (method: string, url: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.group(`🔄 API Call: ${method.toUpperCase()} ${url}`);
    if (data) {
      console.log('Request Data:', data);
    }
    console.groupEnd();
  }
};

// Error handling utility
export const handleApiError = (error: any, defaultMessage = 'An error occurred') => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.message) {
    return error.message;
  }
  return defaultMessage;
};

// Utility for building query strings
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });
  
  return searchParams.toString();
};

export const api = apiClient;
export default apiClient;