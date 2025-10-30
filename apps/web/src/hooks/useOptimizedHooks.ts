import { type DependencyList, useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Optimized state hook with custom equality function
 */
export const useOptimizedState = <T>(
  initialState: T,
  equalityFn?: (_prev: T, _next: T) => boolean
) => {
  const [state, setState] = useState(initialState);

  const optimizedSetState = useCallback(
    (newState: T | ((_prev: T) => T)) => {
      setState((prevState) => {
        const nextState =
          typeof newState === 'function' ? (newState as (_prev: T) => T)(prevState) : newState;

        if (equalityFn?.(prevState, nextState)) {
          return prevState;
        }

        return nextState;
      });
    },
    [equalityFn]
  );

  return [state, optimizedSetState] as const;
};

/**
 * Memoized options generator
 */
export const useMemoizedOptions = <T>(generator: () => T, deps: DependencyList): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(generator, deps);
};

/**
 * Stable callback hook
 */
export const useStableCallback = <T extends (..._args: unknown[]) => unknown>(
  callback: T,
  deps: DependencyList
): T => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(callback, deps);
};

/**
 * Debounced value hook
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  });

  return debouncedValue;
};
