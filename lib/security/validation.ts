/**
 * Security validation utilities
 */

// Rate limiting store (in-memory for single instance, use Redis for multi-instance)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 requests per minute

/**
 * Check rate limit for IP
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record || record.resetTime < now) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  record.count++;
  return true;
}

/**
 * Validate UUID format (UUIDv7 or UUIDv4)
 */
export function validateUuid(uuid: string | undefined): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  
  // Standard UUID format (8-4-4-4-12)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate password format (basic validation)
 */
export function validatePasswordFormat(password: string | undefined): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  // Password should be 1-100 characters
  return password.length >= 1 && password.length <= 100;
}

/**
 * Validate organization slug format
 * Only allows lowercase alphanumeric, hyphens, and underscores (3-63 chars)
 */
export function validateOrgSlug(slug: string | undefined): boolean {
  if (!slug || typeof slug !== 'string') {
    return false;
  }
  
  // Lowercase alphanumeric, hyphens, underscores, 3-63 chars
  const slugRegex = /^[a-z0-9][a-z0-9_-]{1,61}[a-z0-9]$/;
  return slugRegex.test(slug);
}
