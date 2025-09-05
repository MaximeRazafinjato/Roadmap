/**
 * Cookie utility functions for managing user preferences
 */

interface CookieOptions {
  expires?: number; // Number of days until expiration
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Set a cookie with the specified name, value, and options
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  const {
    expires = 365, // Default to 1 year
    path = '/',
    domain,
    secure = window.location.protocol === 'https:',
    sameSite = 'lax'
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  // Add expiration date
  if (expires) {
    const date = new Date();
    date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${date.toUTCString()}`;
  }

  // Add path
  cookieString += `; path=${path}`;

  // Add domain if specified
  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  // Add secure flag if needed
  if (secure) {
    cookieString += '; secure';
  }

  // Add SameSite attribute
  cookieString += `; SameSite=${sameSite}`;

  document.cookie = cookieString;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string, path: string = '/'): void {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
}

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

/**
 * Get all cookies as an object
 */
export function getAllCookies(): Record<string, string> {
  const cookies: Record<string, string> = {};
  const cookieStrings = document.cookie.split(';');

  for (let cookie of cookieStrings) {
    cookie = cookie.trim();
    if (cookie) {
      const [name, value] = cookie.split('=');
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }
  }

  return cookies;
}

// Preference-specific cookie functions
export const preferences = {
  /**
   * Save user preference
   */
  set(key: string, value: string): void {
    setCookie(`pref_${key}`, value, { expires: 365 });
  },

  /**
   * Get user preference
   */
  get(key: string): string | null {
    return getCookie(`pref_${key}`);
  },

  /**
   * Delete user preference
   */
  delete(key: string): void {
    deleteCookie(`pref_${key}`);
  },

  /**
   * Check if preference exists
   */
  has(key: string): boolean {
    return hasCookie(`pref_${key}`);
  }
};

// View mode specific functions
export const viewMode = {
  /**
   * Save view mode preference
   */
  set(mode: 'grid' | 'list'): void {
    preferences.set('view_mode', mode);
  },

  /**
   * Get view mode preference
   */
  get(): 'grid' | 'list' {
    const mode = preferences.get('view_mode');
    return mode === 'list' ? 'list' : 'grid'; // Default to grid
  }
};