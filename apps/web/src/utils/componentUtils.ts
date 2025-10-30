import React, { type ComponentType } from 'react';

/**
 * Creates a memoized component with optional custom comparison function
 */
export const createMemoizedComponent = <P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (_prevProps: P, _nextProps: P) => boolean
): React.MemoExoticComponent<ComponentType<P>> => {
  const MemoizedComponent = React.memo(Component, propsAreEqual);
  MemoizedComponent.displayName = `Memo(${Component.displayName || Component.name})`;
  return MemoizedComponent;
};
