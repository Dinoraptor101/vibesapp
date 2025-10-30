/**
 * Manages group chat state and functionality
 * @param postId - ID of the post the group chat belongs to
 * @param userId - ID of the current user
 * @param messagesEndRef - Reference to the messages end element for scrolling
 * @param isVisible - Boolean indicating if the component is visible
 * @returns {Object} Object containing group chat state and handler functions
 */

import posthog from 'posthog-js';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import apiService from '../services/apiService'; // Adjust the import path as needed
import type { IHandleReply, IMessage, ITooltip } from '../types';
import { convertErrorToMessage } from '../utils/utils';

const MAX_MESSAGE_LENGTH = 120;

const useGroupChatHandler = (
  postId: string,
  userId: string,
  messagesEndRef: React.RefObject<HTMLDivElement>,
  isVisible: boolean
) => {
  const [groupChatId, setGroupChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [replyMessageId, setReplyMessageId] = useState<string | null>(null);
  const [replyUserName, setReplyUserName] = useState<string | null>('');
  const [collapsedMessages, setCollapsedMessages] = useState<{
    [key: string]: boolean;
  }>({});
  const [showNotification, setShowNotification] = useState<{
    message: string;
    type: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [watchedMessages, setWatchedMessages] = useState<IMessage[]>([]);
  const [countdown, setCountdown] = useState<number>(0);
  const [tooltip, setTooltip] = useState<ITooltip>({
    visible: false,
    message: '',
  });
  const [isGroupChatWatched, setIsGroupChatWatched] = useState<boolean | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesEndRef]);

  const fetchMessages = useCallback(
    async (groupChatId: string) => {
      try {
        const response = await apiService.get(
          `/api/messages/groupChat/${groupChatId}/user/${userId}`
        );
        const newMessages: IMessage[] = response.data;
        setMessages(newMessages);
        setWatchedMessages(newMessages.filter((message) => message.isWatched));
      } catch (error) {
        setError(convertErrorToMessage(error));
      }
    },
    [userId]
  );

  const fetchGroupChatWatchStatus = useCallback(
    async (groupChatId: string) => {
      console.log('fetchGroupChatWatchStatus');
      try {
        const response = await apiService.get(
          `/api/groupchats/${groupChatId}/watch/status/${userId}`
        );
        setIsGroupChatWatched(response.data.isWatched);
      } catch (error) {
        console.error(convertErrorToMessage(error));
      }
    },
    [userId]
  );

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    const fetchOrCreateGroupChat = async () => {
      try {
        let response = await apiService.get(`/api/groupChats?postId=${postId}`);
        if (response.data && response.data.length > 0) {
          setGroupChatId(response.data[0]._id);
          fetchMessages(response.data[0]._id);
        } else {
          response = await apiService.post('/api/groupChats', { postId });
          setGroupChatId(response.data._id);
          fetchMessages(response.data._id);
        }
      } catch (error) {
        setError(convertErrorToMessage(error));
      }
    };

    fetchOrCreateGroupChat();
  }, [postId, fetchMessages]);

  useEffect(() => {
    if (groupChatId && isVisible && isExpanded) {
      fetchMessages(groupChatId);
      fetchGroupChatWatchStatus(groupChatId); // Ensure this function is called
      const interval = setInterval(() => fetchMessages(groupChatId), 10000); // Poll every 5 seconds
      return () => clearInterval(interval); // Clear interval on cleanup
    }
  }, [groupChatId, fetchMessages, fetchGroupChatWatchStatus, isVisible, isExpanded]);

  // Track group chat expansion
  useEffect(() => {
    if (isExpanded && groupChatId) {
      posthog.capture('Group Chat Expanded', {
        group_chat_id: groupChatId,
        post_id: postId,
        user_id: userId,
      });
    }
  }, [isExpanded, groupChatId, postId, userId]);

  const handleSendMessage = async () => {
    // Prevent sending a blank message
    if (newMessage.trim() === '') {
      setTooltip({ visible: true, message: 'Message cannot be blank.' });
      setTimeout(() => setTooltip({ visible: false, message: '' }), 3000); // Hide after 3 seconds
      return;
    }

    // Prevent sending if message is too long
    if (newMessage.length > MAX_MESSAGE_LENGTH) {
      setTooltip({
        visible: true,
        message: `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`,
      });
      setTimeout(() => setTooltip({ visible: false, message: '' }), 3000); // Hide after 3 seconds
      return;
    }

    // Prevent send if the countdown is still active
    if (countdown > 0) {
      return;
    }

    // Start the countdown to prevent spamming
    setCountdown(5);

    // Create the message data object
    const messageData = {
      groupChatId,
      userId,
      body: newMessage,
      timestamp: new Date(),
      parentMessageId: replyMessageId || null,
    };

    try {
      // Send the message to the server
      await apiService.post('/api/messages', messageData);

      posthog.capture('Message Sent', {
        group_chat_id: groupChatId,
        post_id: postId,
        user_id: userId,
        is_reply: !!replyMessageId,
        message_length: newMessage.length,
      });

      // Clear the new message input and reset reply state
      setNewMessage('');
      setReplyMessageId(null);
      setReplyUserName('');

      // Fetch the updated messages
      if (groupChatId) {
        fetchMessages(groupChatId);
      } else {
        throw new Error('GroupChatId ID is missing.');
      }

      // Capture the event with PostHog
      posthog.capture('Message Sent', { groupChatId, userId });
    } catch (error) {
      setShowNotification({
        message: convertErrorToMessage(error),
        type: 'error',
      });
      posthog.capture('Message Send Failed', {
        group_chat_id: groupChatId,
        post_id: postId,
        user_id: userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleReply: IHandleReply = (parentMessageId, userName) => {
    setReplyMessageId(parentMessageId);
    setReplyUserName(userName);
  };

  const toggleCollapse = (messageId: string) => {
    setCollapsedMessages((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const toggleWatchMessage = async (messageId: string) => {
    try {
      const response = await apiService.post(`/api/messages/${messageId}/watch`, { userId });

      posthog.capture('Message Watch Toggle', {
        message_id: messageId,
        group_chat_id: groupChatId,
        post_id: postId,
        user_id: userId,
        action: watchedMessages.some((msg) => msg._id === messageId) ? 'unwatch' : 'watch',
      });

      if (response.data.message === 'Watched successfully') {
        setWatchedMessages((prev) => {
          return prev.map((message) => {
            if (message._id === messageId) {
              return {
                ...message,
                isWatched: true,
              };
            }
            return message;
          });
        });
      } else if (response.data.message === 'Unwatched successfully') {
        setWatchedMessages((prev) => prev.filter((watch) => watch._id !== messageId));
      }
    } catch (error) {
      console.error(convertErrorToMessage(error));
    }
  };

  const toggleWatchGroupChat = async () => {
    if (!groupChatId) return;
    try {
      const response = await apiService.post(`/api/groupchats/${groupChatId}/watch`, { userId });

      posthog.capture('Group Chat Watch Toggle', {
        group_chat_id: groupChatId,
        post_id: postId,
        user_id: userId,
        action: isGroupChatWatched ? 'unwatch' : 'watch',
      });

      if (response.data.message === 'Watched successfully') {
        setIsGroupChatWatched(true);
      } else if (response.data.message === 'Unwatched successfully') {
        setIsGroupChatWatched(false);
      }
    } catch (error) {
      console.error(convertErrorToMessage(error));
    }
  };

  const handleDismiss = useCallback(() => {
    setIsExpanded(false);
  }, []);

  return {
    groupChatId,
    messages,
    setMessages,
    newMessage,
    replyMessageId,
    replyUserName,
    collapsedMessages,
    showNotification,
    setShowNotification,
    countdown,
    error,
    isExpanded,
    setIsExpanded,
    tooltip,
    watchedMessages,
    setNewMessage,
    handleSendMessage,
    handleReply,
    scrollToBottom,
    toggleCollapse,
    toggleWatchMessage,
    fetchMessages,
    handleDismiss,
    isGroupChatWatched,
    toggleWatchGroupChat,
    fetchGroupChatWatchStatus,
  };
};

export default useGroupChatHandler;
