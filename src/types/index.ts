// User & Authentication Types
export interface User {
  id: string;
  discordId: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email: string | null;
  hoursBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Service & Booking Types
export type ServiceType = 'ENCH' | 'BO' | 'KD' | 'BOSS';
export type RealmType = 'EU' | 'NA' | 'KR';
export type BookingStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Service {
  id: string;
  type: ServiceType;
  name: string;
  description: string;
  pricePerHour: number;
  available: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  service: ServiceType;
  realm: RealmType;
  duration: number;
  startTime: string;
  endTime: string;
  gameName: string;
  gamePassword: string;
  status: BookingStatus;
  vmId: string | null;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingRequest {
  service: ServiceType;
  realm: RealmType;
  duration: number;
  startTime: string;
  gameName: string;
  gamePassword: string;
}

export interface BookingWithUser extends Booking {
  user: User;
}

// Shop Types
export interface Pack {
  id: string;
  name: string;
  description: string;
  hours: number;
  price: number;
  currency: 'FG' | 'USD' | 'EUR';
  discountPercent: number;
  popular: boolean;
  createdAt: string;
}

export interface CartItem {
  pack: Pack;
  quantity: number;
}

export interface PurchaseRequest {
  packId: string;
  quantity: number;
  paymentMethod: 'stripe' | 'crypto' | 'balance';
}

export interface PurchaseResponse {
  success: boolean;
  transactionId: string;
  hoursAdded: number;
  newBalance: number;
}

// VM & Server Types
export interface VMStatus {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'maintenance' | 'booked';
  currentBooking: Booking | null;
  cpu: number;
  memory: number;
  uptime: number;
  region: RealmType;
}

export interface ServerStats {
  totalServers: number;
  activeBookings: number;
  availableServers: number;
  totalPlayers: number;
}

// WebSocket Types
export type WebSocketEventType =
  | 'booking:started'
  | 'booking:ended'
  | 'booking:cancelled'
  | 'vm:status_changed'
  | 'vm:log'
  | 'user:hours_updated';

export interface WebSocketEvent<T = any> {
  type: WebSocketEventType;
  data: T;
  timestamp: string;
}

export interface VMLogEvent {
  vmId: string;
  message: string;
  level: 'info' | 'warn' | 'error';
  timestamp: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Price Calculation
export interface PriceEstimate {
  basePrice: number;
  hours: number;
  totalPrice: number;
  discountApplied: number;
  finalPrice: number;
}

// News & Updates
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  category: 'update' | 'maintenance' | 'announcement';
  publishedAt: string;
  imageUrl?: string;
}
