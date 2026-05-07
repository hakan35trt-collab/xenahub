import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Connect to MongoDB (optional - app works without it)
connectDB().catch((err) => console.warn('[DB] MongoDB not connected (optional):', err.message));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", isProd ? '' : "'unsafe-eval'"].filter(Boolean),
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https:", "ws:", "wss:"],
      mediaSrc: ["'self'", "https:", "blob:"],
      workerSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// CORS
app.use(cors({
  origin: isProd ? [/xenahub\.online$/, /xenahub\.app$/, /railway\.app$/] : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// Compression
app.use(compression());

// JSON body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP Parameter Pollution prevention
app.use(hpp());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: isProd ? 'production' : 'development' });
});

// Static files - Railway'de dist/ kök dizinde olmalı
const distPath = path.join(__dirname, '..', 'dist');
console.log('[STATIC] Serving from:', distPath);

app.use(express.static(distPath, {
  maxAge: '1y',
  immutable: true,
  setHeaders: (res, filepath) => {
    if (filepath.includes('index.html') || filepath.includes('manifest.json') || filepath.includes('sw.js')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  },
}));

// SPA fallback
app.get('*', (_req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log('[SPA] Serving index.html from:', indexPath);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('[SPA] Error serving index.html:', err);
      res.status(500).json({ error: 'Internal server error', detail: err.message });
    }
  });
});

// Error handling
app.use((_err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[XENAHUB ERROR]', _err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[XENAHUB] Server running on port ${PORT} in ${isProd ? 'production' : 'development'} mode`);
});
