import axios from 'axios';
import { toast } from '@/components/ui/sonner';

const DEFAULT_BASE_URL =
  process.env.REACT_APP_BACKEND_URL
    ? `${process.env.REACT_APP_BACKEND_URL}/api`
    : '/api';

let authTokenResolver = null;

export const setAuthTokenResolver = (resolver) => {
  authTokenResolver = typeof resolver === 'function' ? resolver : null;
};

const extractErrorMessage = (error) => {
  const response = error?.response;
  if (response?.data) {
    const payload = response.data;
    if (typeof payload === 'string') {
      return payload;
    }
    if (payload.detail) {
      if (typeof payload.detail === 'string') {
        return payload.detail;
      }
      if (Array.isArray(payload.detail)) {
        return payload.detail.map((item) => item.msg || item.message).filter(Boolean).join('\n');
      }
    }
    if (payload.message) {
      return payload.message;
    }
  }
  if (error?.message) {
    return error.message;
  }
  return 'Une erreur inattendue est survenue.';
};

export const apiClient = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 20000,
});

apiClient.interceptors.request.use(
  (config) => {
    const nextConfig = { ...config };
    nextConfig.headers = nextConfig.headers || {};

    if (!nextConfig.skipAuth && authTokenResolver) {
      const token = authTokenResolver();
      if (token) {
        nextConfig.headers.Authorization = `Bearer ${token}`;
      }
    }

    return nextConfig;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error?.config?.skipErrorToast) {
      const status = error?.response?.status;
      const message = extractErrorMessage(error);
      const baseLabel = status ? `Erreur ${status}` : 'Erreur';

      toast.error(baseLabel, {
        description: message,
      });
    }

    return Promise.reject(error);
  },
);

export const withErrorToast = (promise, { silent } = {}) =>
  promise.catch((error) => {
    if (silent) {
      return Promise.reject(error);
    }
    const message = extractErrorMessage(error);
    toast.error('Échec de la requête', { description: message });
    return Promise.reject(error);
  });

export const getApiBaseUrl = () => DEFAULT_BASE_URL;
