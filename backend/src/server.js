import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import pinoHTTP from 'pino-http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import depthLimit from 'graphql-depth-limit';
import { createComplexityLimitRule } from 'graphql-validation-complexity';
import prisma from './prisma.js';
import { typeDefs } from './graphql/typeDefs/index.js';
import { resolvers } from './graphql/resolvers/index.js';
import { authMiddleware } from './middlewares/auth.js';
import { authDirective } from './directives/auth.js';
import { graphqlUploadExpress } from 'graphql-upload';
import fs from 'fs';

// ------------------------------
// Bootstrap / Paths / ENV
// ------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Ensure uploads dir exists (relative to project root)
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ------------------------------
// App + HTTP Server
// ------------------------------
const app = express();
const httpServer = http.createServer(app);

// In production (behind Nginx/Railway/Render/etc.), always trust the proxy so
// rate limiting and IP detection use the real client IP, not the proxy IP.
// Override with TRUST_PROXY=0 if your infra doesn't use a proxy.
const trustProxy = process.env.TRUST_PROXY !== undefined
  ? process.env.TRUST_PROXY === '1'
  : process.env.NODE_ENV === 'production';
if (trustProxy) app.set('trust proxy', 1);

// Logger (pretty in dev, compact in prod)
app.use(
  pinoHTTP({
    redact: ['req.headers.authorization'],
    transport: process.env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined,
    autoLogging: true,
  })
);

// Security + perf middleware
app.use(helmet());
app.use(compression());

// CORS
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3002').split(',');
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // allow server-to-server / curl
      const ok = allowedOrigins.some((o) => o === origin || (o.startsWith('/') && new RegExp(o.slice(1, -1)).test(origin)));
      cb(ok ? null : new Error('Not allowed by CORS'), ok);
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'apollo-require-preflight'],
  })
);

// Basic rate limiting (tune for prod)
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: Number(process.env.RATE_LIMIT_PER_MIN || 120),
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Body parsing and cookies
app.use(bodyParser.json({ limit: process.env.JSON_LIMIT || '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: process.env.JSON_LIMIT || '1mb' }));
app.use(cookieParser());

// File uploads (GraphQL multipart)
app.use(
  graphqlUploadExpress({
    maxFileSize: Number(process.env.MAX_UPLOAD_BYTES || 10_000_000), // 10MB
    maxFiles: Number(process.env.MAX_UPLOAD_FILES || 2),
  })
);


// ------------------------------
// Schema + Directives
// ------------------------------
const { authDirectiveType, authDirectiveTransformer } = authDirective('auth');

let schema = makeExecutableSchema({
  typeDefs: [
    `directive @auth(roles: [String] = []) on FIELD_DEFINITION | OBJECT`,
    typeDefs,
  ],
  resolvers,
});

// Apply directive transformer AFTER schema creation
schema = authDirectiveTransformer(schema);

// ------------------------------
// Apollo Server
// ------------------------------
const apollo = new ApolloServer({
  schema,
  // v4: disable dev landing page in prod; Playground option no longer used
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  // Prevent very deep/expensive queries
  validationRules: [
    depthLimit(Number(process.env.GRAPHQL_MAX_DEPTH || 8)),
    createComplexityLimitRule(Number(process.env.GRAPHQL_MAX_COMPLEXITY || 5000), {
      onCost: (cost) => {
        if (process.env.NODE_ENV !== 'production') {
        }
      },
    }),
  ],
  introspection: process.env.NODE_ENV !== 'production',
});

// ------------------------------
// Health endpoints
// ------------------------------
app.get('/healthz', (_req, res) => res.status(200).send('ok'));
app.get('/readyz', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).send('ready');
  } catch (e) {
    res.status(503).send('db not ready');
  }
});

// ------------------------------
// Start
// ------------------------------
async function start() {
  await apollo.start();

  app.use(
    '/graphql',
    expressMiddleware(apollo, {
      context: async ({ req, res }) => {
        // Attach prisma and authenticated user to context
        const base = await authMiddleware({ req, res });
        return {
          ...base,
          prisma,
          operationName: req.body?.operationName
        };
      },
    })
  );

  const PORT = Number(process.env.PORT || 4000);
  httpServer.listen(PORT, () => {
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Error starting server:', err);
  process.exit(1);
});

// ------------------------------
// Shutdown
// ------------------------------
const shutdown = async (signal) => {

  await apollo.stop();
  httpServer.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));


