import { useEffect, useRef } from 'react';
import type { IMessage } from '../types';

/**
 * A custom React hook that manages the visibility of a new message indicator based on scroll position and message updates.
 *
 * @param messages - Array of messages to monitor for changes
 * @param isExpanded - Boolean indicating if the message container is expanded
 * @param scrollToBottom - Function to scroll the message container to the bottom
 * @param setShowNewMessageIndicator - Function to control the visibility of the new message indicator
 * @param isNearBottom - Function that returns true if the scroll position is near the bottom
 *
 * The hook will:
 * - Show the new message indicator when new messages arrive and the user is not at the bottom
 * - Automatically scroll to bottom when new messages arrive if the user is already at the bottom
 * - Hide the indicator when the user is near the bottom of the message container
 */
export const useNewMessageIndicator = (
  messages: IMessage[],
  isExpanded: boolean,
  scrollToBottom: () => void,
  // eslint-disable-next-line no-unused-vars
  setShowNewMessageIndicator: (show: boolean) => void,
  isNearBottom: () => boolean
) => {
  const previousTopLevelMessagesLength = useRef(0);

  useEffect(() => {
    const handleNewMessages = async () => {
      const topLevelMessages = messages.filter((msg) => !msg.parentMessageId);

      if (isExpanded && topLevelMessages.length > previousTopLevelMessagesLength.current) {
        if (isNearBottom()) {
          scrollToBottom();
          setShowNewMessageIndicator(false);
        } else {
          setShowNewMessageIndicator(true);
        }
      }

      previousTopLevelMessagesLength.current = topLevelMessages.length;
    };

    handleNewMessages();
    if (isNearBottom()) {
      setShowNewMessageIndicator(false);
    }
  }, [messages, isExpanded, scrollToBottom, setShowNewMessageIndicator, isNearBottom]);
};
