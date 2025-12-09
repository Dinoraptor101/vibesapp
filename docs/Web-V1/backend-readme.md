# VibesApp Backend API Documentation

## Overview

VibesApp is a location-based social media platform built with Node.js, Express, and MongoDB. Users can create posts, interact within a 100-mile radius, earn karma points ("vibes"), and participate in group chats and direct messaging.

## 🚀 Quick Start

### Base URLs

- **Production**: `https://api.vibesapp.net`
- **QA**: `https://api-qa.vibesapp.net`
- **Development**: `http://localhost:5001`

### Authentication

All API requests require two headers:

```javascript
{
  'x-api-key': 'your-api-key',
  'x-pigeon-id': 'user-pigeon-id'
}
```

## 📊 Core Concepts

### Location-Based Interactions

- Users can only react to posts from users within **100 miles**
- Post reactions are counted as "proximal" only if within this radius
- Location is required for all user actions

### Karma System (Vibes)

Users start with **195 vibes** and can earn/lose points through actions:

| Action          | Vibes Change | Notes                                 |
| --------------- | ------------ | ------------------------------------- |
| Create Post     | -2           | Costs vibes to post                   |
| Create Reply    | -1           | Half the cost of a post               |
| Delete Post     | +1           | Partial refund                        |
| Give Like       | +1           | Reward for positive engagement        |
| Give Dislike    | -3           | Penalty for negative engagement       |
| Receive Like    | +4           | Reward for creating liked content     |
| Receive Dislike | -10          | Penalty for creating disliked content |
| Send DM Request | -6           | Cost to initiate private conversation |
| Daily Login     | +1           | Reward for activity                   |

**Permissions by Vibes Level:**

- **50+ vibes**: Controls access
- **100+ vibes**: Group chat access
- **200+ vibes**: Direct messaging
- **300+ vibes**: Omniverse access
- **Maximum**: 399 vibes

### Post Hiding Logic

Posts are automatically hidden when:

```javascript
post.proximal_dislikes > post.proximal_users / 3;
```

## 🛠 API Endpoints

### Users

#### Create User

```http
POST /api/user/create
Content-Type: application/json

{
  "pigeonId": "unique-pigeon-id",
  "userName": "string",
  "birthYear": 1995,
  "birthMonth": 6,
  "polarity": "yin|yang",
  "mbtiPersonality": "INFP",
  "sex": "string",
  "location": {
    "lat": 40.7128,
    "lon": -74.0060
  }
}
```

#### Login

```http
GET /api/user/login/{pigeonId}
```

#### Get User Details

```http
GET /api/user/{userId}
```

#### Update User

```http
PUT /api/user/{userId}
```

#### Get User Posts

```http
GET /api/user/{userId}/posts
```

### Posts

#### Create Post

```http
POST /api/post/create
Content-Type: application/json

{
  "text": "Post content (optional)",
  "image": "s3-image-key",
  "user": {
    "userId": "string",
    "userName": "string",
    "birthYear": 1995,
    "birthMonth": 6,
    "sex": "string",
    "location": {
      "lat": 40.7128,
      "lon": -74.0060
    }
  },
  "replyTo": "post-id-if-reply"
}
```

#### Get Posts Feed

```http
GET /api/post/
```

#### Get Single Post

```http
GET /api/post/{postId}
```

#### Like Post

```http
POST /api/post/{postId}/like
Content-Type: application/json

{
  "userId": "string",
  "location": {
    "lat": 40.7128,
    "lon": -74.0060
  }
}
```

#### Dislike Post

```http
POST /api/post/{postId}/dislike
```

#### Delete Post

```http
DELETE /api/post/{postId}
```

### Direct Messages

#### Send DM Request

```http
POST /api/dm/request
Content-Type: application/json

{
  "fromUserId": "sender-id",
  "toUserId": "recipient-id"
}
```

#### Approve DM Request

```http
POST /api/dm/approve
Content-Type: application/json

{
  "conversationId": "conversation-id",
  "userId": "user-id"
}
```

#### Decline DM Request

```http
POST /api/dm/decline
```

#### Send DM Message

```http
POST /api/dm/message
Content-Type: application/json

{
  "conversationId": "conversation-id",
  "senderId": "sender-id",
  "content": "message-content"
}
```

#### Get Conversations

```http
GET /api/dm/conversations?userId={userId}
```

#### Get Single Conversation

```http
GET /api/dm/conversation/{conversationId}
```

### Group Chat

#### Send Group Chat Message

```http
POST /api/groupchat/message
Content-Type: application/json

{
  "postId": "post-id",
  "senderId": "sender-id",
  "content": "message-content"
}
```

#### Get Group Chat Messages

```http
GET /api/groupchat/{postId}/messages
```

### Activity Feed

#### Get User Activities

```http
GET /api/activity/{userId}
```

#### Mark Activity as Read

```http
PUT /api/activity/{activityId}/read
```

### File Upload (S3)

#### Get Signed Upload URL

```http
GET /api/s3/s3Url
```

Returns:

```json
{
  "url": "presigned-s3-upload-url",
  "key": "unique-file-key"
}
```

**Upload Process:**

1. Get signed URL from `/api/s3/s3Url`
2. Upload image directly to S3 using the signed URL
3. Use the returned `key` in your post creation request

### Health Check

```http
GET /api/health
```

## 📱 Data Models

### User Model

```javascript
{
  userId: String,          // Unique identifier
  pigeonId: String,        // Authentication ID
  userName: String,        // Display name
  birthYear: Number,       // Birth year
  birthMonth: Number,      // Birth month (1-12)
  polarity: String,        // "yin" or "yang"
  mbtiPersonality: String, // MBTI type
  sex: String,            // User's sex
  location: {
    lat: Number,          // Latitude
    lon: Number           // Longitude
  },
  vibes: Number,          // Karma points (default: 195)
  lastActiveAt: Date      // Last activity timestamp
}
```

### Post Model

```javascript
{
  text: String,           // Post content (optional)
  image: String,          // S3 image key (required)
  user: UserSubSchema,    // Embedded user data
  replyTo: ObjectId,      // Parent post ID (for replies)
  reactions: [ReactionSchema],
  proximal_likes: Number,    // Likes from nearby users
  proximal_dislikes: Number, // Dislikes from nearby users
  proximal_users: Number,    // Total nearby users who reacted
  isHidden: Boolean,         // Auto-calculated based on dislikes
  createdAt: Date
}
```

### Message Model (Group Chat)

```javascript
{
  postId: ObjectId,       // Associated post
  senderId: String,       // Message sender
  content: String,        // Message content
  timestamp: Date,        // When sent
  isRead: Boolean         // Read status
}
```

### Conversation Model (DM)

```javascript
{
  participants: [String], // User IDs
  messages: [MessageSchema],
  status: String,         // "pending", "active", "closed"
  lastMessageAt: Date,
  createdAt: Date
}
```

## 🔧 Frontend Integration Tips

### Rate Limiting

- **Message Cooldown**: 5-second interval between messages
- **Location Updates**: Cache user location to avoid repeated requests

### Error Handling

Common error responses:

```javascript
// Insufficient vibes
{
  error: "Insufficient vibes for this action",
  required: 200,
  current: 150
}

// Location required
{
  error: "Location is required for this action"
}

// Authentication error
{
  error: "Invalid pigeon ID or API key"
}
```

### Real-time Features

The app uses Socket.IO for real-time updates:

- New messages in group chats
- DM notifications
- Activity feed updates
- Live reaction counts

### Image Handling

1. **Get Upload URL**: Call `/api/s3/s3Url`
2. **Upload to S3**: Use the presigned URL with `PUT` request
3. **Create Post**: Use the returned `key` in post data

### Location Services

- Always send current user location with reactions
- Implement location permission handling
- Consider caching location for short periods to improve UX

### Vibes Management

- Display current vibes count prominently
- Warn users before expensive actions (DM requests, dislikes)
- Show permission requirements for locked features
- Implement vibes history/transaction log

### Performance Optimization

- Implement pagination for posts feed
- Cache user data locally
- Debounce location updates
- Lazy load images from S3

## 🔒 Security Notes

- Never expose API keys in client-side code
- Validate all user inputs on frontend
- Implement proper error boundaries
- Handle authentication failures gracefully
- Use HTTPS for all API calls

## 🚀 Deployment

The backend is deployed on:

- **Production**: Heroku/AWS (vibesapp.net)
- **QA**: Staging environment (qa.vibesapp.net)

Environment variables required:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`
- `AWS_REGION`
- `MONGODB_URI`
- `API_KEY`

## 📞 Support

For API issues or questions:

- Check server logs for detailed error messages
- Verify authentication headers
- Ensure location data is properly formatted
- Test with Postman/curl first before implementing in frontend

## 🔄 API Versioning

Current API version: `v1` (implicit in all endpoints)
Breaking changes will be communicated with version bumps.
