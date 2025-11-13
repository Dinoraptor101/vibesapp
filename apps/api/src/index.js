require('dotenv').config();
require('./tracer');
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5001;
const isProduction = process.env.NODE_ENV === 'production';

const corsOptions = {
  origin: [
    'https://vibesapp.net', // PROD frontend
    'https://api.vibesapp.net', // PROD backend
    'https://qa.vibesapp.net', // QA frontend
    'https://api-qa.vibesapp.net', // QA backend
    'https://dinoraptor101.github.io', // Failover production
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-pigeon-id'],
  optionsSuccessStatus: 200,
};

if (!isProduction) {
  corsOptions.origin.push('http://localhost:3000');
  corsOptions.origin.push('http://127.0.0.1:3000');
  corsOptions.origin.push('http://localhost:5173'); // Vite dev server (web-v2)
  corsOptions.origin.push('http://127.0.0.1:5173'); // Vite dev server (web-v2)
  corsOptions.origin.push('http://localhost:5174'); // Vite dev server alternate port
  corsOptions.origin.push('http://127.0.0.1:5174'); // Vite dev server alternate port
}

app.use(cors(corsOptions));
app.use(express.json());

// Middleware to posthog log request duration - only in production
if (isProduction) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${req.method}] ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// Middleware to log every API call
app.use((req, res, next) => {
  console.log(`API call: ${req.method} ${req.originalUrl}`);
  next();
});

// Import and use the API key middleware
const apiKeyMiddleware = require('./middleware/apiKey');
const pigeonAuthMiddleware = require('./middleware/pigeonAuth');
app.use(apiKeyMiddleware);
app.use(pigeonAuthMiddleware);

// Import Routes
const userRoutes = require('./routes/user');
const postRoutes = require('./routes/post');
const s3Routes = require('./routes/s3');
const issueRoutes = require('./routes/issue');
const activityRouter = require('./routes/activity');
const adminRouter = require('./routes/admin');
const groupChatRoutes = require('./routes/groupchat');
const messageRoutes = require('./routes/message');
const healthCheckRouter = require('./routes/healthCheck');
const recaptchaRoutes = require('./routes/recaptcha');
const dmRoutes = require('./routes/dm');
const dmRequestRoutes = require('./routes/dmRequest');

// Helper function to wrap route registration with detailed error logging
function useRoute(path, router) {
  try {
    app.use(path, router);
  } catch (error) {
    console.error(`Error in router for path ${path}:`, error);
    throw error;
  }
}

// Use Routes
useRoute('/api/users', userRoutes);
useRoute('/api/posts', postRoutes);
useRoute('/api/messages', messageRoutes);
useRoute('/api/s3', s3Routes);
useRoute('/api/issues', issueRoutes);
useRoute('/api/activities', activityRouter);
useRoute('/api/admin', adminRouter);
useRoute('/api/groupChats', groupChatRoutes);
useRoute('/api/health', healthCheckRouter);
useRoute('/api/recaptcha', recaptchaRoutes);
useRoute('/api/dm', dmRoutes);
useRoute('/api/dm-requests', dmRequestRoutes);

// MongoDB Connection
console.log('Connecting to MongoDB...');
mongoose
  .connect(process.env.MONGO_URI, {
    ssl: true,
    tlsAllowInvalidCertificates: !isProduction,
  })
  .then(() => {
    console.log('MongoDB connected');
    // Start the server only after successful MongoDB connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${isProduction ? 'production' : 'development'}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from DB');
});

// Catch-all route to redirect non-API requests to frontend
// Redirect all non-API routes to the frontend (for client-side routing)
app.use((_req, res) => {
  console.log('Redirecting to frontend...');
  res.redirect(process.env.FRONTEND_URL);
});
