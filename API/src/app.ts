import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import routes from './routes';
import corsOptions from './config/cors';

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "https://www.openstreetmap.org"], // Allow scripts from self and OSM for the map
        "frame-src": ["'self'", "https://www.openstreetmap.org"], // Allow iframes from self and OpenStreetMap
        "img-src": ["'self'", "data:", "http://localhost:3000", "*.tile.openstreetmap.org"], // Allow map tiles
      },
    },
    // This is important for allowing cross-origin resource sharing for images
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false, // Setting this to false can help with some cross-origin issues
  })
);

// CORS configuration
app.use(cors(corsOptions));

// Compression middleware
app.use(compression());

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined,
  });
  next();
});

// API routes
app.use('/api/v1', routes);

// Static files serving
// This makes the 'public' folder accessible. A request to '/uploads/image.png' will
// correctly serve the file from 'API/public/uploads/image.png'.
app.use(express.static(path.join(__dirname, '../public')));

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;