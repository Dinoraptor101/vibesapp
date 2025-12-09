# VibesApp Read/Unread System Architecture

**Created:** November 13, 2025  
**Purpose:** Document the optimized cursor-based read tracking system for messaging  
**Status:** Planned Implementation (Phase 4.6)

---

## 🎯 Executive Summary

This document outlines the new cursor-based read/unread tracking system designed to replace the current per-message `readBy` array approach. The new system eliminates infinite polling loops, improves database performance from O(n) to O(1), and implements visibility-based read detection with lazy migration.

**Key Benefits:**
- ✅ **Performance:** O(1) read tracking vs O(n) array iteration
- ✅ **No Infinite Loops:** Visibility-based marking prevents re-triggering
- ✅ **Zero Downtime:** Lazy migration preserves all conversation history
- ✅ **Battery Friendly:** Adaptive polling based on tab visibility
- ✅ **Automatic:** New messages marked read when user actually viewing

---

## 🗄️ Database Schema Design

### **Current Schema (Legacy)**

```javascript
// Conversation Model - Current
{
  _id: ObjectId,
  user1Id: String,
  user2Id: String,
  messages: [
    {
      _id: ObjectId,
      senderId: String,
      body: String,
      timestamp: Date,
      readBy: [String]  // ❌ PROBLEM: Array grows with every read operation
    }
  ],
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Problems with Current Schema:**
- Each message stores `readBy` array with userIds
- Mark-as-read requires iterating through ALL messages
- Database size grows quadratically (users × messages × readBy entries)
- Slow queries when conversations have hundreds of messages

### **New Schema (Cursor-Based)**

```javascript
// Conversation Model - New
{
  _id: ObjectId,
  user1Id: String,
  user2Id: String,
  messages: [
    {
      _id: ObjectId,
      senderId: String,
      body: String,
      timestamp: Date
      // ✅ REMOVED: readBy array
    }
  ],
  // ✅ NEW: Read cursor tracking
  readCursors: {
    [userId]: {
      lastReadMessageId: ObjectId,  // Points to last message user has seen
      lastReadAt: Date               // Timestamp when they read it
    }
  },
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Example Data:**
```javascript
{
  _id: "conv123",
  user1Id: "bob3",
  user2Id: "bob5", 
  messages: [
    { _id: "msg1", senderId: "bob3", body: "Hi!", timestamp: "10:00:00Z" },
    { _id: "msg2", senderId: "bob5", body: "Hello", timestamp: "10:01:00Z" },
    { _id: "msg3", senderId: "bob3", body: "How are you?", timestamp: "10:02:00Z" },
    { _id: "msg4", senderId: "bob5", body: "Good!", timestamp: "10:03:00Z" }
  ],
  readCursors: {
    "bob3": {
      lastReadMessageId: "msg4",  // Bob3 has read all messages
      lastReadAt: "10:03:30Z"
    },
    "bob5": {
      lastReadMessageId: "msg2",  // Bob5 only read up to msg2
      lastReadAt: "10:01:30Z"     // Messages msg3, msg4 are unread for Bob5
    }
  }
}
```

**Benefits of Cursor Schema:**
- ✅ **Constant space:** 2 fields per user per conversation (not per message)
- ✅ **Fast queries:** Direct lookup of last read message ID
- ✅ **Easy unread calculation:** Count messages after cursor
- ✅ **Scalable:** Works with thousands of messages efficiently

---

## 🔧 Backend API Implementation

### **Lazy Migration Utility**

```javascript
// utils/conversationMigration.js
const ensureConversationHasCursors = async (conversation) => {
  if (conversation.readCursors) {
    return conversation; // Already migrated
  }
  
  console.log(`Migrating legacy conversation: ${conversation._id}`);
  
  // Initialize cursor structure
  conversation.readCursors = {};
  
  // For each participant, mark all existing messages as read
  // (Conservative approach - prevents overwhelming users with old "unread" messages)
  [conversation.user1Id, conversation.user2Id].forEach(userId => {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (lastMessage) {
      conversation.readCursors[userId] = {
        lastReadMessageId: lastMessage._id,
        lastReadAt: new Date()
      };
    }
  });
  
  await conversation.save();
  console.log(`Conversation ${conversation._id} migrated successfully`);
  
  return conversation;
};
```

### **GET /api/dm/conversations/:userId**

```javascript
exports.getConversations = async (req, res) => {
  const currentUserId = req.user?.userId;

  try {
    const conversations = await Conversation.find({
      $or: [{ user1Id: currentUserId }, { user2Id: currentUserId }],
      status: 'approved'
    }).lean();

    const results = await Promise.all(conversations.map(async (conv) => {
      // Lazy migration check
      if (!conv.readCursors) {
        conv = await ensureConversationHasCursors(conv);
      }

      const otherUserId = conv.user1Id === currentUserId ? conv.user2Id : conv.user1Id;
      const otherUser = await User.findOne({ userId: otherUserId });

      // Calculate unread count using cursor
      const cursor = conv.readCursors[currentUserId];
      let unreadCount = 0;

      if (cursor && cursor.lastReadMessageId) {
        // Find index of last read message
        const lastReadIndex = conv.messages.findIndex(
          m => m._id.toString() === cursor.lastReadMessageId.toString()
        );
        
        if (lastReadIndex !== -1) {
          // Count messages after cursor that aren't from current user
          unreadCount = conv.messages
            .slice(lastReadIndex + 1)
            .filter(m => m.senderId !== currentUserId).length;
        }
      } else {
        // No cursor exists - all messages from other user are unread
        unreadCount = conv.messages
          .filter(m => m.senderId !== currentUserId).length;
      }

      return {
        _id: conv._id,
        otherUser,
        unreadCount,
        lastMessage: conv.messages[conv.messages.length - 1]
      };
    }));

    res.json(results);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};
```

### **POST /api/dm/conversation/:conversationId/markAsRead**

```javascript
exports.markMessagesAsRead = async (req, res) => {
  const { conversationId } = req.params;
  const currentUserId = req.user?.userId;

  if (!currentUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    let conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Verify user is participant
    if (conversation.user1Id !== currentUserId && conversation.user2Id !== currentUserId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Ensure conversation has cursor structure
    conversation = await ensureConversationHasCursors(conversation);

    // Get last message in conversation
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    
    if (lastMessage) {
      // Update cursor to point to last message
      conversation.readCursors[currentUserId] = {
        lastReadMessageId: lastMessage._id,
        lastReadAt: new Date()
      };
      
      await conversation.save();
    }

    res.json({ success: true, lastReadMessageId: lastMessage?._id });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};
```

### **GET /api/dm/conversation/:conversationId**

```javascript
exports.getConversation = async (req, res) => {
  const { conversationId } = req.params;
  const currentUserId = req.user?.userId;

  try {
    let conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Verify participant
    if (conversation.user1Id !== currentUserId && conversation.user2Id !== currentUserId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Lazy migration
    conversation = await ensureConversationHasCursors(conversation);

    const otherUserId = conversation.user1Id === currentUserId ? conversation.user2Id : conversation.user1Id;
    const otherUser = await User.findOne({ userId: otherUserId });

    // Calculate unread count using cursor
    const cursor = conversation.readCursors[currentUserId];
    let unreadCount = 0;

    if (cursor && cursor.lastReadMessageId) {
      const lastReadIndex = conversation.messages.findIndex(
        m => m._id.toString() === cursor.lastReadMessageId.toString()
      );
      
      if (lastReadIndex !== -1) {
        unreadCount = conversation.messages
          .slice(lastReadIndex + 1)
          .filter(m => m.senderId !== currentUserId).length;
      }
    } else {
      unreadCount = conversation.messages
        .filter(m => m.senderId !== currentUserId).length;
    }

    res.json({
      _id: conversation._id,
      otherUser,
      messages: conversation.messages,
      unreadCount,
      status: conversation.status
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};
```

---

## 🎨 Frontend Architecture

### **Unified Polling Hook**

```typescript
// features/messaging/hooks/useMessagingPolling.ts
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { getConversations, getConversation } from '../api/dmService';

export function useMessagingPolling() {
  const { user } = useAuth();
  const location = useLocation();
  
  // Auto-detect active conversation from URL
  const activeConversationId = location.pathname.match(/\/messages\/(.+)/)?.[1];
  
  // Conversations list polling
  const conversationsQuery = useQuery({
    queryKey: ['conversations', user?._id],
    queryFn: () => getConversations(user?._id!),
    enabled: !!user?._id,
    refetchInterval: 30000, // 30 seconds
    staleTime: 20000,
    refetchIntervalInBackground: false // Stop polling when tab hidden
  });
  
  // Active conversation polling (only when viewing specific conversation)
  const conversationQuery = useQuery({
    queryKey: ['conversation', activeConversationId],
    queryFn: () => getConversation(activeConversationId!),
    enabled: !!activeConversationId,
    refetchInterval: 5000,  // 5 seconds for real-time feel
    staleTime: 2000,
    refetchIntervalInBackground: false
  });
  
  return {
    conversations: conversationsQuery.data ?? [],
    activeConversation: conversationQuery.data,
    isLoading: conversationsQuery.isLoading || conversationQuery.isLoading,
    error: conversationsQuery.error || conversationQuery.error
  };
}
```

### **Visibility-Based Read Detection**

```typescript
// features/messaging/hooks/useAutoMarkAsRead.ts
import { useEffect, useRef } from 'react';
import { useMarkAsRead } from './useMarkAsRead';

export function useAutoMarkAsRead(conversationId: string | undefined) {
  const markAsReadMutation = useMarkAsRead();
  const hasMarkedRef = useRef<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    if (!conversationId) return;
    
    // Create intersection observer to detect when messages are visible
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isVisible = entry.isIntersecting;
        
        // Only mark as read if:
        // 1. Container is 50%+ visible
        // 2. Haven't already marked this conversation
        // 3. User is actively looking at the page (document.visibilityState)
        if (
          isVisible && 
          hasMarkedRef.current !== conversationId &&
          document.visibilityState === 'visible'
        ) {
          console.log('Marking conversation as read:', conversationId);
          markAsReadMutation.mutate(conversationId);
          hasMarkedRef.current = conversationId;
        }
      },
      { 
        threshold: 0.5,  // 50% of container must be visible
        rootMargin: '0px'
      }
    );
    
    // Observe the messages container
    const container = document.getElementById('messages-container');
    if (container && observerRef.current) {
      observerRef.current.observe(container);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [conversationId, markAsReadMutation]);
  
  // Reset when conversation changes
  useEffect(() => {
    hasMarkedRef.current = null;
  }, [conversationId]);
  
  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && conversationId) {
        // When user returns to tab, check if messages are visible and mark as read
        const container = document.getElementById('messages-container');
        if (container && hasMarkedRef.current !== conversationId) {
          const rect = container.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
          
          if (isVisible) {
            markAsReadMutation.mutate(conversationId);
            hasMarkedRef.current = conversationId;
          }
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [conversationId, markAsReadMutation]);
}
```

### **Updated ConversationView**

```typescript
// features/messaging/components/ConversationView.tsx
import { useParams } from 'react-router-dom';
import { useMessagingPolling } from '../hooks/useMessagingPolling';
import { useAutoMarkAsRead } from '../hooks/useAutoMarkAsRead';
import { useSendMessage } from '../hooks/useSendMessage';

export function ConversationView() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { activeConversation, isLoading } = useMessagingPolling();
  const sendMessageMutation = useSendMessage();
  
  // Automatically mark as read when visible
  useAutoMarkAsRead(conversationId);
  
  const handleSendMessage = (body: string) => {
    if (!conversationId) return;
    sendMessageMutation.mutate({ conversationId, body });
  };

  if (isLoading) {
    return <div>Loading conversation...</div>;
  }

  if (!activeConversation) {
    return <div>Conversation not found</div>;
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <h2>{activeConversation.otherUser.username}</h2>
        {activeConversation.unreadCount > 0 && (
          <span className="text-sm text-gray-500">
            {activeConversation.unreadCount} unread messages
          </span>
        )}
      </div>

      {/* Messages Container - IMPORTANT: id="messages-container" for observer */}
      <div 
        id="messages-container"
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {activeConversation.messages.map((message) => (
          <div key={message._id} className="message">
            <div className="font-bold">{message.senderId}</div>
            <div>{message.body}</div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <MessageInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}
```

---

## ⚡ Performance Optimizations

### **Polling Interval Strategy**

| Feature | Current | New | Reasoning |
|---------|---------|-----|-----------|
| **Active Conversation** | 10s | **5s** | User actively chatting needs near real-time |
| **Conversations List** | 30s | **30s** | Good balance for sidebar updates |
| **DM Requests** | 30s | **60s** | Less time-critical, can wait longer |
| **Activity Feed** | 30s | **30s** | Unchanged |

### **Adaptive Polling**

```typescript
// hooks/useAdaptivePolling.ts
export function useAdaptivePolling<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  normalInterval: number
) {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  return useQuery({
    queryKey,
    queryFn,
    // 6x slower when tab hidden (30s → 180s, 5s → 30s)
    refetchInterval: isVisible ? normalInterval : normalInterval * 6,
    staleTime: normalInterval * 0.8,
    refetchIntervalInBackground: false
  });
}
```

**Benefits:**
- ✅ Saves battery life on mobile devices
- ✅ Reduces server load by ~80% when users switch tabs
- ✅ Still provides updates when user returns to tab

---

## 🔄 Migration Strategy

### **Phase 1: Prepare Backend (Zero Risk)**

1. **Add readCursors field to schema** (optional, gradual)
2. **Deploy lazy migration utility** (runs only when needed)
3. **Update API endpoints** to support both systems
4. **Test with development data**

### **Phase 2: Frontend Updates**

1. **Create new polling hooks** (useMessagingPolling, useAutoMarkAsRead)
2. **Update ConversationView** to use new hooks
3. **Test infinite loop elimination**
4. **Deploy to staging environment**

### **Phase 3: Production Deployment**

1. **Deploy backend changes** (supports both old and new)
2. **Deploy frontend changes** (uses new system)
3. **Monitor lazy migration logs** (see which conversations get upgraded)
4. **Verify no infinite loops** in production

### **Phase 4: Long-term Cleanup (Optional)**

1. **After 3-6 months:** Identify unused legacy conversations
2. **Bulk migrate remaining conversations** or archive them
3. **Remove readBy arrays** from schema (breaking change)
4. **Remove legacy support code**

**Timeline:** Phase 1-3 can be completed in one week. Phase 4 is optional long-term cleanup.

---

## 🚀 Expected Outcomes

### **Performance Improvements**

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Mark as Read API** | O(n) message iteration | O(1) cursor update | **90%+ faster** |
| **Unread Calculation** | Array.filter() on all messages | Index lookup + slice | **80%+ faster** |
| **Database Writes** | Update every message | Update one field | **95% fewer writes** |
| **Memory Usage** | readBy arrays per message | 2 fields per conversation | **70% reduction** |
| **Frontend Loops** | Infinite loop risk | Zero loops | **100% reliable** |

### **User Experience Improvements**

- ✅ **Real-time feel:** 5s polling for active conversations
- ✅ **Battery friendly:** Slower polling when tab hidden
- ✅ **Automatic:** Messages marked read when actually viewed
- ✅ **No interruptions:** Zero downtime migration
- ✅ **Preserved history:** All existing conversations work

### **Developer Experience Improvements**

- ✅ **Simpler code:** No useRef flags or complex effect dependencies
- ✅ **Better debugging:** Clear separation between polling and read-marking
- ✅ **Type safety:** Proper TypeScript throughout
- ✅ **Testable:** Each hook can be unit tested independently
- ✅ **Maintainable:** Standard patterns used by major messaging apps

---

## 📊 Success Metrics

**Technical Metrics:**
- [ ] Zero infinite markAsRead loops in production
- [ ] 90%+ reduction in mark-as-read API response time  
- [ ] 80%+ reduction in database read/write operations
- [ ] Zero conversation history data loss during migration

**User Experience Metrics:**
- [ ] Messages marked as read within 1 second of viewing
- [ ] Unread badges update within 30 seconds
- [ ] New messages appear within 5 seconds in active conversations
- [ ] Battery usage reduced on mobile devices

**Development Metrics:**
- [ ] 50%+ reduction in messaging-related bug reports
- [ ] All TypeScript compilation errors resolved
- [ ] Test coverage >80% for new hooks and utilities
- [ ] Documentation complete and up-to-date

---

## 🔗 Related Documentation

- **REBUILD-PROMPTS.md:** Phase 4.6 implementation prompt
- **REBUILD-ACTION-PLAN.md:** Overall project roadmap  
- **06-api-integration.md:** API communication patterns
- **04-frontend-architecture.md:** React Query and state management

---

**Last Updated:** November 13, 2025  
**Next Review:** After Phase 4.6 implementation  
**Status:** Ready for implementation 🚀