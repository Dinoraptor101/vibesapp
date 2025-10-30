import type React from 'react';
import { useEffect, useRef } from 'react';

/**
 * Custom hook for cleanup effects
 */
export const useCleanupEffect = (cleanup: () => void, deps: React.DependencyList) => {
  useEffect(() => {
    return cleanup;
  }, deps);
};

/**
 * Custom hook for timeout cleanup
 */
export const useTimeout = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout
  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => savedCallback.current(), delay);
    return () => clearTimeout(id);
  }, [delay]);
};

/**
 * Custom hook for interval cleanup
 */
export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
};

/**
 * Custom hook for event listener cleanup
 */
export const useEventListener = <T extends string>(
  eventName: T,
  handler: (_event: Event) => void,
  element: EventTarget | null = typeof window !== 'undefined' ? window : null
) => {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element) return;

    const eventListener = (event: Event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
};

/**
 * Custom hook for abort controller cleanup
 */
export const useAbortController = () => {
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    controllerRef.current = new AbortController();

    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, []);

  return controllerRef.current;
};

/**
 * Custom hook for resource cleanup
 */
export const useResourceCleanup = <T>(resource: T, cleanup: (_resource: T) => void) => {
  const resourceRef = useRef(resource);

  useEffect(() => {
    resourceRef.current = resource;
  }, [resource]);

  useEffect(() => {
    return () => {
      if (resourceRef.current) {
        cleanup(resourceRef.current);
      }
    };
  }, [cleanup]);
};

/**
 * Debounce function with cleanup
 */
export const useDebounce = <T extends (..._args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = ((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }) as T;

  return debouncedCallback;
};

/**
 * Memory leak prevention utilities
 */
