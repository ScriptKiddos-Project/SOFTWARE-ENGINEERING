// API-related types and interfaces

// Base API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: ValidationError[];
  meta?: ResponseMeta;
}

export interface ResponseMeta {
  pagination?: PaginationMeta;
  filters?: Record<string, any>;
  sort?: SortMeta;
  timestamp: string;
  requestId?: string;
  version?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SortMeta {
  field: string;
  order: 'asc' | 'desc';
}

// Error handling
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  path?: string;
  method?: string;
  statusCode: number;
}

export type ApiErrorCode = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'BAD_REQUEST'
  | 'FORBIDDEN';

// HTTP methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request configuration
export interface RequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  signal?: AbortSignal;
}

// Base query parameters
export interface BaseQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// File upload types
export interface FileUploadConfig {
  maxSize: number; // in bytes
  allowedTypes: string[];
  maxFiles?: number;
  compress?: boolean;
  quality?: number; // for image compression
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Batch operations
export interface BatchRequest<T = any> {
  operations: T[];
  validateAll?: boolean;
  stopOnError?: boolean;
}

export interface BatchResponse<T = any> {
  success: boolean;
  results: Array<{
    success: boolean;
    data?: T;
    error?: string;
    index: number;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

// WebSocket message types
export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  data: T;
  timestamp: string;
  id?: string;
  userId?: string;
  roomId?: string;
}

export type WebSocketMessageType = 
  | 'connection'
  | 'disconnection'
  | 'message'
  | 'notification'
  | 'event_update'
  | 'club_update'
  | 'user_update'
  | 'typing'
  | 'presence'
  | 'error';

// API endpoints structure
export interface ApiEndpoints {
  auth: {
    login: string;
    register: string;
    logout: string;
    refresh: string;
    forgotPassword: string;
    resetPassword: string;
    verifyEmail: string;
    resendVerification: string;
  };
  users: {
    profile: string;
    update: string;
    uploadAvatar: string;
    dashboardStats: string;
    search: string;
    connections: string;
    activities: string;
    leaderboard: string;
  };
  clubs: {
    list: string;
    detail: (id: string) => string;
    create: string;
    update: (id: string) => string;
    delete: (id: string) => string;
    members: (id: string) => string;
    join: (id: string) => string;
    leave: (id: string) => string;
    categories: string;
    analytics: (id: string) => string;
    activities: (id: string) => string;
  };
  events: {
    list: string;
    detail: (id: string) => string;
    create: string;
    update: (id: string) => string;
    delete: (id: string) => string;
    register: (id: string) => string;
    unregister: (id: string) => string;
    registrations: (id: string) => string;
    attendance: (id: string) => string;
    bulkAttendance: (id: string) => string;
    qrCode: (id: string) => string;
    qrAttendance: string;
    calendar: string;
    feedback: (id: string) => string;
    analytics: (id: string) => string;
  };
  admin: {
    users: string;
    clubs: string;
    events: string;
    analytics: string;
    settings: string;
  };
  notifications: {
    list: string;
    markRead: (id: string) => string;
    markAllRead: string;
    preferences: string;
  };
  upload: {
    image: string;
    file: string;
    avatar: string;
    clubLogo: string;
    eventImage: string;
  };
}

// Real-time subscription types
export interface Subscription {
  id: string;
  type: SubscriptionType;
  channel: string;
  filters?: Record<string, any>;
  callback: (data: any) => void;
  isActive: boolean;
  createdAt: Date;
}

export type SubscriptionType = 
  | 'event_updates'
  | 'club_updates'
  | 'user_notifications'
  | 'chat_messages'
  | 'presence_updates'
  | 'system_alerts';

// Cache configuration
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  key: string;
  tags?: string[]; // For cache invalidation
  staleWhileRevalidate?: boolean;
  maxAge?: number;
}

// Rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

// API versioning
export type ApiVersion = 'v1' | 'v2';

export interface VersionedEndpoint {
  version: ApiVersion;
  path: string;
  deprecated?: boolean;
  deprecationDate?: string;
  replacedBy?: string;
}

// Webhook types (for future integrations)
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: any;
  timestamp: string;
  signature: string;
}

export type WebhookEventType = 
  | 'user.created'
  | 'user.updated'
  | 'club.created'
  | 'club.updated'
  | 'event.created'
  | 'event.updated'
  | 'event.completed'
  | 'registration.created'
  | 'attendance.marked';

// External service integration types
export interface ExternalServiceConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  timeout: number;
  retries: number;
  rateLimit?: {
    requests: number;
    window: number; // in seconds
  };
}

// Search and filtering types
export interface SearchResult<T> {
  items: T[];
  total: number;
  facets?: SearchFacet[];
  suggestions?: string[];
  took: number; // Query time in ms
}

export interface SearchFacet {
  field: string;
  values: Array<{
    value: string;
    count: number;
  }>;
}

export interface SearchQuery {
  q?: string;
  filters?: Record<string, any>;
  facets?: string[];
  highlight?: boolean;
  suggestions?: boolean;
  fuzzy?: boolean;
}

// Analytics and tracking types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
  context?: AnalyticsContext;
}

export interface AnalyticsContext {
  page?: {
    url: string;
    title: string;
    referrer?: string;
  };
  user?: {
    id: string;
    email?: string;
    department?: string;
  };
  device?: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
  campaign?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
}

// Health check and monitoring
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: ServiceHealth;
    cache: ServiceHealth;
    storage: ServiceHealth;
    email: ServiceHealth;
  };
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  lastChecked: string;
}

// Feature flags
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage?: number;
  conditions?: Record<string, any>;
  variants?: FeatureFlagVariant[];
}

export interface FeatureFlagVariant {
  name: string;
  weight: number;
  payload?: any;
}

// A/B Testing
export interface ExperimentConfig {
  id: string;
  name: string;
  variants: ExperimentVariant[];
  traffic: number; // Percentage of users to include
  conditions?: Record<string, any>;
  metrics: string[];
  isActive: boolean;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  weight: number;
  config: Record<string, any>;
}

// Data export types
export interface ExportRequest {
  type: ExportType;
  format: ExportFormat;
  filters?: Record<string, any>;
  fields?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export type ExportType = 
  | 'users'
  | 'clubs'
  | 'events'
  | 'registrations'
  | 'attendance'
  | 'analytics';

export type ExportFormat = 'csv' | 'json' | 'xlsx' | 'pdf';

export interface ExportResponse {
  id: string;
  status: ExportStatus;
  downloadUrl?: string;
  progress?: number;
  estimatedCompletion?: string;
  error?: string;
  createdAt: string;
  expiresAt: string;
}

export type ExportStatus = 
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'expired';

// Import types
export interface ImportRequest {
  type: ImportType;
  format: ImportFormat;
  file: File;
  options?: ImportOptions;
}

export type ImportType = 'users' | 'clubs' | 'events';
export type ImportFormat = 'csv' | 'json' | 'xlsx';

export interface ImportOptions {
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  validateOnly?: boolean;
  mapping?: Record<string, string>; // Field mapping
}

export interface ImportResponse {
  id: string;
  status: ImportStatus;
  progress?: number;
  summary?: ImportSummary;
  errors?: ImportError[];
  warnings?: ImportWarning[];
  createdAt: string;
}

export type ImportStatus = 
  | 'queued'
  | 'validating'
  | 'processing'
  | 'completed'
  | 'failed';

export interface ImportSummary {
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  skippedRows: number;
}

export interface ImportError {
  row: number;
  field?: string;
  message: string;
  code: string;
  data?: any;
}

export interface ImportWarning {
  row: number;
  field?: string;
  message: string;
  data?: any;
}