import type React from 'react';
import type { IMessage, IMessageList } from '../../types';
import MessageItem from './MessageItem';

/**
 * @component MessageList
 * @description Renders a hierarchical list of messages with threading support.
 * Handles message collapsing, reply chains, and message watching functionality.
 * Each message can be expanded/collapsed to show/hide its replies.
 *
 * @param {IMessageList} props - Component properties
 * @param {IMessage[]} props.messages - Array of messages to display
 * @param {boolean} props.isExpanded - Whether the chat window is expanded
 * @param {function} props.toggleCollapse - Function to toggle message thread collapse
 * @param {function} props.handleReply - Function to handle message replies
 * @param {function} props.toggleWatchMessage - Function to toggle message watching
 * @param {Object} props.collapsedMessages - Object tracking collapsed message threads
 * @param {IMessage[]} props.watchedMessages - Array of messages being watched
 */
const MessageList: React.FC<IMessageList> = ({
  messages,
  isExpanded,
  toggleCollapse,
  handleReply,
  toggleWatchMessage,
  collapsedMessages,
  watchedMessages,
}) => {
  const renderMessages = (
    messages: IMessage[],
    parentMessageId: string | null = null,
    depth = 0
  ) => {
    const watchedMessageIds = watchedMessages?.map((watch: IMessage) => watch._id) || [];

    return messages
      .filter((message) => message.parentMessageId === parentMessageId)
      .map((message) => {
        const hasReplies = messages.some((reply) => reply.parentMessageId === message._id);
        const isWatched = watchedMessageIds.includes(message._id);
        const replyCount = messages.filter((reply) => reply.parentMessageId === message._id).length;

        return (
          <MessageItem
            key={message._id}
            message={message}
            depth={depth}
            isExpanded={isExpanded}
            hasReplies={hasReplies}
            isWatched={isWatched}
            replyCount={replyCount}
            toggleCollapse={toggleCollapse}
            handleReply={handleReply}
            toggleWatchMessage={async (id: string) => await toggleWatchMessage?.(id)}
            collapsedMessages={collapsedMessages}
            renderMessages={(
              messages: IMessage[],
              parentId?: string | null | undefined,
              depth?: number
            ) => renderMessages(messages, parentId || null, depth || 0)} // Pass renderMessages as a prop
            messages={messages} // Pass messages as a prop
          />
        );
      });
  };

  return <ul className="messages-list">{renderMessages(messages)}</ul>;
};

export default MessageList;
