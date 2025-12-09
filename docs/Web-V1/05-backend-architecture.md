# Backend Architecture

The VibesApp backend is a Node.js/Express application that provides the API services for the social platform. It handles user authentication, post management, real-time messaging, and the vibes calculation system.

## Technology Stack

### Core Technologies

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Atlas hosting
- **Socket.IO** - Real-time bidirectional communication
- **AWS S3** - File storage and image hosting
- **AWS CloudFront** - Content delivery network

### Supporting Services

- **MongoDB Atlas** - Managed database hosting (Production & QA)
- **Heroku** - Application hosting platform
- **GitHub Actions** - CI/CD pipeline
- **PostHog** - Analytics and user tracking

## API Architecture

### Base URLs

- **Production**: `https://api.vibesapp.net`
- **QA**: `https://api-qa.vibesapp.net`
- **Development**: `http://localhost:5001`

### Authentication System

All API requests require authentication headers:

```javascript
{
  'x-api-key': 'your-api-key',     // Global API access key
  'x-pigeon-id': 'user-pigeon-id'  // User identification token
}
```

### API Versioning

- Current version: `v1` (implicit in all endpoints)
- Versioning strategy: URL-based (`/api/v1/...` for future versions)
- Backward compatibility maintained for breaking changes

## Data Models

### User Model

```javascript
{
  userId: String,          // Unique identifier (generated)
  pigeonId: String,        // Authentication ID (user-provided)
  userName: String,        // Display name
  birthYear: Number,       // Birth year
  birthMonth: Number,      // Birth month (1-12)
  polarity: String,        // "yin" or "yang"
  mbtiPersonality: String, // MBTI type (e.g., "INFP")
  sex: String,            // User's sex
  location: {
    lat: Number,          // Latitude
    lon: Number           // Longitude
  },
  vibes: Number,          // Karma points (default: 195)
  lastActiveAt: Date,     // Last activity timestamp
  createdAt: Date,        // Account creation date
  updatedAt: Date         // Last profile update
}
```

### Post Model

```javascript
{
  _id: ObjectId,          // MongoDB document ID
  text: String,           // Post content (optional for posts with images)
  image: String,          // S3 image key (required for posts, optional for comments)
  user: {                 // Embedded user data (snapshot)
    userId: String,
    userName: String,
    birthYear: Number,
    birthMonth: Number,
    sex: String,
    location: {
      lat: Number,
      lon: Number
    }
  },
  replyTo: ObjectId,      // Reserved for future post-to-post replies (V1 feature)
  commentOn: ObjectId,    // Parent post ID (if this document is a comment)
  replyToCommentId: ObjectId, // Parent comment ID (if this is a reply to another comment)
  reactions: [{           // User reactions array
    userId: String,
    type: String,         // "like" or "dislike"
    location: {
      lat: Number,
      lon: Number
    },
    timestamp: Date
  }],
  proximal_likes: Number,    // Likes from nearby users
  proximal_dislikes: Number, // Dislikes from nearby users
  proximal_users: Number,    // Total nearby users who reacted
  isHidden: Boolean,         // Auto-calculated based on community feedback
  createdAt: Date,
  updatedAt: Date
}
```

### Comment System Architecture (Polymorphic Design)

Comments are stored in the **same `Post` collection** as regular posts, using a polymorphic design pattern. This architectural decision reduces code duplication since comments share most fields with posts (text, user, reactions, location, timestamps).

#### How It Works

```
┌──────────────────────────────────────────────────────┐
│              MongoDB: Post Collection                 │
│                                                      │
│  ┌─────────────────┐      ┌─────────────────────┐   │
│  │  Regular Post   │      │      Comment        │   │
│  │  commentOn:     │      │  commentOn:         │   │
│  │     null        │      │    <postId>         │   │
│  │  image:         │      │  image: null        │   │
│  │    required     │      │    (optional)       │   │
│  └─────────────────┘      └─────────────────────┘   │
└──────────────────────────────────────────────────────┘
           ▲                          ▲
           │                          │
     /api/posts                /api/comments
   (filters out comments)    (dedicated endpoint)
```

#### Key Fields

| Field | Purpose |
|-------|---------|
| `commentOn` | If set, this document is a comment on the referenced post |
| `replyToCommentId` | If set, this comment is a reply to another comment (threading) |
| `replyTo` | Reserved for future post-to-post reply feature (V1 legacy) |

#### API Separation

Despite sharing the same data model, comments have **dedicated endpoints**:

- **`POST /api/comments`** - Create a comment
- **`GET /api/comments/:postId`** - Get comments for a post
- **`DELETE /api/comments/:commentId`** - Delete a comment

The posts endpoint (`/api/posts`) automatically **filters out comments**:
```javascript
filteredPosts = filteredPosts.filter((post) => !post.commentOn);
```

#### Why This Design?

1. **Shared functionality** - Comments can be "vibed" (liked/disliked) just like posts
2. **Consistent reactions** - Same reaction system for both posts and comments
3. **Reduced duplication** - One model, one set of validation logic
4. **Flexible queries** - Easy to aggregate posts with comment counts

#### Trade-offs

- The `Post` collection serves dual purposes (can be confusing at first)
- Must remember to filter by `commentOn` when querying posts
- Frontend types include `commentOn?: string` even though posts don't use it

### Conversation Model (Direct Messages)

```javascript
{
  _id: ObjectId,
  participants: [String], // Array of user IDs
  messages: [{
    senderId: String,
    content: String,
    timestamp: Date,
    isRead: Boolean
  }],
  status: String,         // "pending", "active", "closed"
  lastMessageAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model (Group Chat)

```javascript
{
  postId: ObjectId,       // Associated post
  senderId: String,       // Message sender
  content: String,        // Message content
  timestamp: Date,        // When sent
  isRead: Boolean,        // Read status
  mentions: [String],     // Mentioned user IDs
  replyTo: ObjectId       // Reply to another message
}
```

### Activity Model

```javascript
{
  userId: String,         // Target user
  type: String,          // Activity type ("like", "reply", "mention", "dm")
  fromUserId: String,    // Source user
  postId: ObjectId,      // Related post (if applicable)
  content: String,       // Activity description
  isRead: Boolean,       // Read status
  timestamp: Date
}
```

## Core API Endpoints

### User Management

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

#### User Authentication

```http
GET /api/user/login/{pigeonId}
```

Returns user data if pigeon ID is valid, used for session initialization.

#### User Profile Operations

```http
GET /api/user/{userId}           # Get user details
PUT /api/user/{userId}           # Update user profile
GET /api/user/{userId}/posts     # Get user's posts
GET /api/user/{userId}/vibes     # Get user's vibes count
```

### Post Management

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

#### Post Interactions

```http
GET /api/post/                   # Get posts feed
GET /api/post/{postId}           # Get single post
POST /api/post/{postId}/like     # Like post
POST /api/post/{postId}/dislike  # Dislike post
DELETE /api/post/{postId}        # Delete post
```

### Messaging System

#### Direct Messages

```http
POST /api/dm/request             # Send DM request
POST /api/dm/approve             # Approve DM request
POST /api/dm/decline             # Decline DM request
POST /api/dm/message             # Send DM message
GET /api/dm/conversations        # Get user conversations
GET /api/dm/conversation/{id}    # Get specific conversation
```

#### Group Chat

```http
POST /api/groupchat/message      # Send group chat message
GET /api/groupchat/{postId}/messages # Get group chat messages
```

### File Upload (S3 Integration)

```http
GET /api/s3/s3Url               # Get presigned upload URL
```

## Business Logic Implementation

### Vibes Calculation System

#### Action Costs and Rewards

```javascript
const VIBES_CONFIG = {
  actions: {
    CREATE_POST: -2,
    CREATE_REPLY: -1,
    DELETE_POST: +1,
    GIVE_LIKE: +1,
    GIVE_DISLIKE: -3,
    RECEIVE_LIKE: +4,
    RECEIVE_DISLIKE: -10,
    SEND_DM_REQUEST: -6,
    DAILY_LOGIN: +1,
  },
  limits: {
    STARTING_VIBES: 195,
    MAXIMUM_VIBES: 399,
    MINIMUM_VIBES: 0,
  },
  permissions: {
    BASIC_CONTROLS: 50,
    GROUP_CHAT: 100,
    DIRECT_MESSAGE: 200,
    OMNIVERSE: 300,
  },
};
```

#### Location-Based Interaction Validation

```javascript
function isProximalInteraction(userLocation, postLocation) {
  const distance = calculateDistance(userLocation.lat, userLocation.lon, postLocation.lat, postLocation.lon);
  return distance <= 100; // 100-mile radius
}

function updateVibes(userId, action, isProximal = true) {
  if (!isProximal && ['RECEIVE_LIKE', 'RECEIVE_DISLIKE'].includes(action)) {
    // Non-proximal reactions don't affect vibes
    return;
  }

  const vibesChange = VIBES_CONFIG.actions[action];
  // Update user vibes with bounds checking
  updateUserVibes(userId, vibesChange);
}
```

### Post Hiding Algorithm

```javascript
function shouldHidePost(post) {
  const { proximal_dislikes, proximal_users } = post;

  // Hide if more than 1/3 of proximal users disliked
  return proximal_dislikes > proximal_users / 3;
}

// Automatically applied on each reaction
function updatePostVisibility(postId) {
  const post = getPost(postId);
  post.isHidden = shouldHidePost(post);
  savePost(post);
}
```

### Permission Validation

```javascript
function hasPermission(userVibes, requiredLevel) {
  return userVibes >= VIBES_CONFIG.permissions[requiredLevel];
}

// Middleware for protected endpoints
function requireVibesLevel(level) {
  return async (req, res, next) => {
    const userVibes = await getUserVibes(req.headers['x-pigeon-id']);

    if (!hasPermission(userVibes, level)) {
      return res.status(403).json({
        error: 'Insufficient vibes for this action',
        required: VIBES_CONFIG.permissions[level],
        current: userVibes,
      });
    }

    next();
  };
}
```

## Real-time Features (Socket.IO)

### Socket Event Handlers

```javascript
io.on('connection', (socket) => {
  socket.on('join-post-chat', (postId) => {
    socket.join(`post-${postId}`);
  });

  socket.on('send-group-message', async (data) => {
    const { postId, senderId, content } = data;

    // Validate permissions
    const userVibes = await getUserVibes(senderId);
    if (!hasPermission(userVibes, 'GROUP_CHAT')) {
      socket.emit('error', 'Insufficient vibes for group chat');
      return;
    }

    // Save message and broadcast
    const message = await saveGroupMessage(data);
    io.to(`post-${postId}`).emit('new-group-message', message);
  });

  socket.on('send-dm', async (data) => {
    const { conversationId, senderId, content } = data;

    // Validate permissions and conversation access
    const conversation = await getConversation(conversationId);
    if (!conversation.participants.includes(senderId)) {
      socket.emit('error', 'Unauthorized');
      return;
    }

    // Save message and notify participants
    const message = await saveDMMessage(data);
    conversation.participants.forEach((participantId) => {
      io.to(`user-${participantId}`).emit('new-dm', message);
    });
  });
});
```

### Event Types

- **`new-group-message`** - Real-time group chat messages
- **`new-dm`** - Direct message notifications
- **`post-update`** - Post reaction updates
- **`vibes-change`** - User vibes updates
- **`activity-notification`** - New activity feed items

## Security Implementation

### Authentication & Authorization

```javascript
// API key validation middleware
function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }

  next();
}

// User identification middleware
async function validateUser(req, res, next) {
  const pigeonId = req.headers['x-pigeon-id'];

  if (!pigeonId) {
    return res.status(401).json({ error: 'Missing pigeon ID' });
  }

  const user = await getUserByPigeonId(pigeonId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid pigeon ID' });
  }

  req.user = user;
  next();
}
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const messageRateLimit = rateLimit({
  windowMs: 5 * 1000, // 5 seconds
  max: 1, // 1 message per window
  message: 'Please wait before sending another message',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/groupchat/message', messageRateLimit);
app.use('/api/dm/message', messageRateLimit);
```

### Data Validation

```javascript
const { body, validationResult } = require('express-validator');

const validateCreatePost = [
  body('text').optional().isLength({ max: 500 }),
  body('image').notEmpty().withMessage('Image is required'),
  body('user.location.lat').isFloat({ min: -90, max: 90 }),
  body('user.location.lon').isFloat({ min: -180, max: 180 }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
```

## Database Design

### MongoDB Collections

- **users** - User profiles and account data
- **posts** - Content posts and replies
- **conversations** - Direct message conversations
- **groupmessages** - Group chat messages
- **activities** - User activity feed items

### Indexing Strategy

```javascript
// Geographic queries
db.posts.createIndex({ 'user.location': '2dsphere' });

// User lookups
db.users.createIndex({ pigeonId: 1 });
db.users.createIndex({ userId: 1 });

// Post queries
db.posts.createIndex({ createdAt: -1 });
db.posts.createIndex({ replyTo: 1 });
db.posts.createIndex({ isHidden: 1 });

// Message queries
db.groupmessages.createIndex({ postId: 1, timestamp: -1 });
db.conversations.createIndex({ participants: 1 });
```

### Data Relationships

- **Embedded Documents** - User data in posts (for performance)
- **References** - Post replies, conversation participants
- **Denormalization** - Proximal reaction counts for fast queries

## Deployment & Infrastructure

### Environment Configuration

```javascript
// Production environment variables
const config = {
  mongoUrl: process.env.MONGODB_URI,
  awsAccessKey: process.env.AWS_ACCESS_KEY_ID,
  awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3Bucket: process.env.AWS_S3_BUCKET,
  awsRegion: process.env.AWS_REGION,
  apiKey: process.env.API_KEY,
  port: process.env.PORT || 5001,
};
```

### Health Monitoring

```javascript
app.get('/api/health', async (req, res) => {
  try {
    // Check database connectivity
    await mongoose.connection.db.admin().ping();

    // Check S3 connectivity
    await s3.headBucket({ Bucket: process.env.AWS_S3_BUCKET }).promise();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        storage: 'connected',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
    });
  }
});
```

## Performance Optimization

### Caching Strategy

- **In-memory caching** - User vibes, frequently accessed posts
- **Database indexing** - Optimized queries for common operations
- **CDN caching** - Static assets and images via CloudFront

### Query Optimization

```javascript
// Efficient post feed query with location filtering
async function getPostsFeed(userLocation, radius = 100) {
  return db.posts.aggregate([
    {
      $geoNear: {
        near: userLocation,
        distanceField: 'distance',
        maxDistance: radius * 1609.34, // Convert miles to meters
        spherical: true,
      },
    },
    {
      $match: { isHidden: { $ne: true } },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $limit: 50,
    },
  ]);
}
```

## Future Considerations

### Scalability Improvements

- **Database sharding** - Horizontal scaling for large user base
- **Microservices** - Split into specialized services (auth, posts, messaging)
- **Redis caching** - Distributed caching layer
- **Load balancing** - Multiple server instances

### Feature Enhancements

- **Push notifications** - Mobile app integration
- **Content moderation** - AI-powered content filtering
- **Analytics** - Enhanced user behavior tracking
- **Backup & recovery** - Automated data backup systems
