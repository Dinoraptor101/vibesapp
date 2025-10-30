/**
 * Determines if a scrollable container is near its bottom
 * @param conversationBoxRef - Reference to the scrollable container element
 * @returns {Function} - Callback function that returns true if the container is scrolled near bottom
 */
import { type RefObject, useCallback } from 'react';

export const useNearBottom = (conversationBoxRef: RefObject<HTMLDivElement>) => {
  return useCallback(() => {
    const conversationBox = conversationBoxRef.current;
    if (!conversationBox) return false;
    const { scrollTop, scrollHeight, clientHeight } = conversationBox;
    return scrollHeight - scrollTop - clientHeight < 200;
  }, [conversationBoxRef]);
};
