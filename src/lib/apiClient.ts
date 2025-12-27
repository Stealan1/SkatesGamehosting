import type {
  User,
  AuthResponse,
  Service,
  Booking,
  CreateBookingRequest,
  Pack,
  PurchaseRequest,
  PurchaseResponse,
  VMStatus,
  ServerStats,
  PriceEstimate,
  NewsItem,
  ApiResponse,
  ApiError,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Custom API Error class
export class ApiClientError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  const tokens = localStorage.getItem('auth_tokens');
  if (!tokens) return null;
  try {
    const parsed = JSON.parse(tokens);
    return parsed.accessToken;
  } catch {
    return null;
  }
};

// Base fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      if (isJson) {
        const errorData: ApiError = await response.json();
        throw new ApiClientError(
          errorData.message || 'Request failed',
          response.status,
          errorData
        );
      } else {
        throw new ApiClientError(
          `Request failed with status ${response.status}`,
          response.status
        );
      }
    }

    if (isJson) {
      const data = await response.json();
      // Handle wrapped responses
      if (data.success !== undefined) {
        return (data as ApiResponse<T>).data;
      }
      return data;
    }

    return {} as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new ApiClientError(error.message, 0);
    }
    throw new ApiClientError('An unexpected error occurred', 0);
  }
}

// API Client
export const apiClient = {
  // Authentication
  auth: {
    me: () => fetchApi<User>('/me'),
    refresh: (refreshToken: string) =>
      fetchApi<AuthResponse>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }),
  },

  // Services
  services: {
    list: () => fetchApi<Service[]>('/services'),
    getPriceEstimate: (hours: number) =>
      fetchApi<PriceEstimate>(`/price?hours=${hours}`),
  },

  // Bookings
  bookings: {
    list: () => fetchApi<Booking[]>('/bookings'),
    create: (data: CreateBookingRequest) =>
      fetchApi<Booking>('/book', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    cancel: (bookingId: string) =>
      fetchApi<{ success: boolean }>('/cancel', {
        method: 'POST',
        body: JSON.stringify({ bookingId }),
      }),
    get: (bookingId: string) => fetchApi<Booking>(`/bookings/${bookingId}`),
  },

  // Shop
  shop: {
    listPacks: () => fetchApi<Pack[]>('/shop/packs'),
    purchase: (data: PurchaseRequest) =>
      fetchApi<PurchaseResponse>('/shop/buy', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // VMs & Server Status
  vms: {
    list: () => fetchApi<VMStatus[]>('/vms'),
    get: (vmId: string) => fetchApi<VMStatus>(`/vms/${vmId}`),
    stats: () => fetchApi<ServerStats>('/stats'),
  },

  // News
  news: {
    list: () => fetchApi<NewsItem[]>('/news'),
    get: (newsId: string) => fetchApi<NewsItem>(`/news/${newsId}`),
  },
};
