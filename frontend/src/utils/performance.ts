// Performance Utilities for Admin Panel
// Provides debouncing, throttling, and other performance optimizations

/**
 * Debounce function - delays execution until after wait milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };

  // Cancel pending execution
  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}

/**
 * Throttle function - limits execution to once per wait period
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();

  const memoized = (...args: Parameters<T>): ReturnType<T> => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = func(...args);
    cache.set(key, result);

    return result;
  };

  memoized.clear = () => cache.clear();
  memoized.size = () => cache.size;

  return memoized as T;
}

/**
 * Lazy load images with intersection observer
 */
export function useLazyLoadImage(
  src: string,
  options?: IntersectionObserverInit
): [string | null, React.RefObject<HTMLImageElement>] {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  useEffect(() => {
    const element = imgRef.current;
    if (!element || !src) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadedSrc(src);
          observer.unobserve(element);
        }
      },
      { rootMargin: '50px', ...options }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [src, options]);

  return [loadedSrc, imgRef];
}

/**
 * Batch multiple state updates into single render
 */
export function batchUpdates(updates: Array<() => void>): void {
  updates.forEach(update => update());
}

/**
 * Create a cancellable async operation
 */
export function createCancellableAsync<T>(asyncFn: () => Promise<T>) {
  let cancelled = false;

  const promise = asyncFn().then(result => {
    if (cancelled) throw new Error('Operation cancelled');
    return result;
  });

  return {
    promise,
    cancel: () => { cancelled = true; },
    isCancelled: () => cancelled,
  };
}

/**
 * Measure render performance
 */
export function usePerformanceMonitor(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Perf] ${componentName} mounted at ${new Date().toISOString()}`);
      
      return () => {
        console.log(`[Perf] ${componentName} unmounted at ${new Date().toISOString()}`);
      };
    }
  }, [componentName]);
}

// Predefined debounce times for common admin operations
export const DEBOUNCE_TIMES = {
  SEARCH_INPUT: 300,       // Search input fields
  FILTER_CHANGE: 200,     // Filter dropdowns
  FORM_INPUT: 500,        // Form field inputs
  RESIZE: 150,            // Window resize events
  SCROLL: 100,            // Scroll events
} as const;

// Predefined throttle times for common operations
export const THROTTLE_TIMES = {
  BUTTON_CLICK: 1000,     // Button clicks
  API_CALL: 2000,         // API requests
  SCROLL_HANDLER: 16,     // Smooth scrolling (~60fps)
  MOUSE_MOVE: 16,         // Mouse tracking
} as const;

export default {
  debounce,
  throttle,
  memoize,
  useLazyLoadImage,
  batchUpdates,
  createCancellableAsync,
  usePerformanceMonitor,
  DEBOUNCE_TIMES,
  THROTTLE_TIMES,
};
