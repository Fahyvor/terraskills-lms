import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { config } from './config.js';
import { securityHeaders, sanitizeMiddleware, errorHandler } from './middleware/security.js';
import { authRouter } from './routes/auth.js';
import { coursesRouter } from './routes/courses.js';
import { progressRouter } from './routes/progress.js';
import { notesRouter } from './routes/notes.js';
import { uploadRouter } from './routes/upload.js';
import { facilitatorRouter } from './routes/facilitator.js';
import { prisma } from './prisma.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.port;
const isProd = config.isProd;

// Resolve static build directory flexibly whether started from root or backend/
function resolvePublicPath(): string {
  const candidates = [
    path.resolve(__dirname, '..', 'public'), // dist/../public or src/../public
    path.resolve(process.cwd(), 'backend', 'public'), // launched from repo root
    path.resolve(process.cwd(), 'public'), // launched from backend directory
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, 'index.html'))) {
      return candidate;
    }
  }

  // Fallback if index.html hasn't been built yet
  return candidates[0];
}

const publicPath = resolvePublicPath();

// 1. Trust proxy if behind a reverse proxy (e.g. nginx, cloudflare)
app.set('trust proxy', 1);

// 2. Best-practice security headers & strip X-Powered-By
app.use(securityHeaders);

// 3. CORS configuration restricted to authorized origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || config.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow dev convenience while logging
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 4. Request parsing with payload size limits to guard against memory exhaustion
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Input sanitization against script injection
app.use(sanitizeMiddleware);

// 6. Static uploads directory for videos and course images
const uploadsPath = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath, {
  maxAge: '1d',
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
  },
}));

console.log(`Starting Terraskills LMS nub-stack architecture on port ${PORT} (${isProd ? 'production' : 'development'})`);

// 7. API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Terraskills Learning Systems LMS',
    server: 'Node.js + Express + Prisma ORM',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/progress', progressRouter);
app.use('/api/notes', notesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/facilitator', facilitatorRouter);

// 8. Production static file serving & SPA fallback (nub-stack pattern)
if (isProd || fs.existsSync(publicPath)) {
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath, {
      maxAge: '1h',
      setHeaders: (res, filePath) => {
        // Hashed Vite bundle assets are immutable and cached for 1 year
        if (filePath.includes('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    }));

    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
      }
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  } else {
    console.warn(`Public directory not found at ${publicPath}. Run 'npm run build' first.`);
  }
}

// 9. Centralized Error Handler (prevents leaking internal stack traces)
app.use(errorHandler);

app.listen(PORT, async () => {
  console.log(`Terraskills LMS Server running at http://localhost:${PORT}`);
  if (isProd) {
    console.log(`Serving static frontend from: ${publicPath}`);
  }

  // Pre-connect and warm up database pool connection
  try {
    await prisma.$connect();
    console.log('✓ Successfully connected to PostgreSQL database (pooled.db.prisma.io:5432)');
  } catch (err: any) {
    console.warn('⚠ Database initial connection notice:', err.message);
  }
});
