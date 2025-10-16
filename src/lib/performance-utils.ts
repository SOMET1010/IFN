// Performance optimization utilities

// Image lazy loading with intersection observer
export const createImageObserver = () => {
  if (typeof window === 'undefined') return null;

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        img.src = img.dataset.src || img.src;
        img.classList.remove('lazy');
        imageObserver?.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.1
  });
};

let imageObserver: IntersectionObserver | null = null;

export const initLazyLoading = () => {
  if (typeof window === 'undefined') return;

  imageObserver = createImageObserver();
  const lazyImages = document.querySelectorAll('img.lazy');

  lazyImages.forEach(img => {
    imageObserver?.observe(img);
  });
};

// Debounce function for search inputs
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Virtual scrolling helper
export const calculateVisibleItems = (
  scrollTop: number,
  itemHeight: number,
  containerHeight: number,
  totalItems: number
) => {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 2,
    totalItems
  );

  return { startIndex, endIndex };
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  if (typeof window === 'undefined' || !window.performance) {
    fn();
    return;
  }

  const start = performance.now();
  fn();
  const end = performance.now();

  console.log(`${name} took ${end - start} milliseconds`);
};

// Memoization helper
export const memoize = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Optimized scroll handler
export const createOptimizedScrollHandler = (callback: () => void) => {
  let ticking = false;

  return () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };
};

// Network status checker
export const checkNetworkStatus = () => {
  if (typeof window === 'undefined') return { online: true, rtt: 0 };

  const connection = (navigator as unknown as { connection?: { rtt?: number; effectiveType?: string; saveData?: boolean } }).connection;

  return {
    online: navigator.onLine,
    rtt: connection?.rtt || 0,
    effectiveType: connection?.effectiveType || '4g',
    saveData: connection?.saveData || false
  };
};

// Optimized image URL generator
export const getOptimizedImageUrl = (
  url: string,
  width?: number,
  height?: number,
  quality = 80
): string => {
  if (!url) return '';

  // If it's already an optimized URL or external, return as is
  if (url.includes('?') || url.startsWith('http')) {
    return url;
  }

  // Add optimization parameters
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  params.set('q', quality.toString());

  return `${url}?${params.toString()}`;
};

// Battery status checker (for performance adjustments)
export const getBatteryStatus = async () => {
  if (typeof window === 'undefined' || !(navigator as unknown as { getBattery?: () => Promise<{ level: number; charging: boolean }> }).getBattery) {
    return { level: 1, charging: true };
  }

  try {
    const battery = await (navigator as unknown as { getBattery?: () => Promise<{ level: number; charging: boolean }> }).getBattery();
    return {
      level: battery.level,
      charging: battery.charging
    };
  } catch {
    return { level: 1, charging: true };
  }
};

// Performance-based quality adjustment
export const getOptimalQuality = async () => {
  const network = checkNetworkStatus();
  const battery = await getBatteryStatus();

  // Reduce quality on slow connections or low battery
  if (network.effectiveType === 'slow-2g' || network.effectiveType === '2g') {
    return 60;
  }

  if (battery.level < 0.2 && !battery.charging) {
    return 70;
  }

  if (network.saveData) {
    return 50;
  }

  return 85;
};

// Cache utilities
export const cacheManager = {
  get: (key: string): unknown => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const { value, expiry } = JSON.parse(item);
      if (new Date().getTime() > expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return value;
    } catch {
      return null;
    }
  },

  set: (key: string, value: unknown, ttl: number = 3600000): void => {
    try {
      const item = {
        value,
        expiry: new Date().getTime() + ttl
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to cache item:', error);
    }
  },

  remove: (key: string): void => {
    localStorage.removeItem(key);
  },

  clear: (): void => {
    localStorage.clear();
  }
};

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    '/fonts/inter-var.woff2',
    '/images/logo.png'
  ];

  criticalResources.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = url.endsWith('.woff2') ? 'font' : 'image';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Service worker registration
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('ServiceWorker registration successful with scope: ', registration.scope);
  } catch (error) {
    console.log('ServiceWorker registration failed: ', error);
  }
};