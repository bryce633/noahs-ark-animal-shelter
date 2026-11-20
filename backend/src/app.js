import { URL } from 'node:url';
import { Router, HttpError, sendJson, readJsonBody, runHandlers } from './lib/http.js';
import { config } from './config.js';

import { authRouter } from './routes/auth.js';
import { animalsRouter } from './routes/animals.js';
import { medicalRouter } from './routes/medical.js';
import { peopleRouter } from './routes/people.js';
import { applicationsRouter } from './routes/applications.js';
import { adoptionsRouter } from './routes/adoptions.js';
import { dashboardRouter } from './routes/dashboard.js';
import { publicRouter } from './routes/public.js';

const router = new Router();
router.use('', authRouter);
router.use('', animalsRouter);
router.use('', medicalRouter);
router.use('', peopleRouter);
router.use('', applicationsRouter);
router.use('', adoptionsRouter);
router.use('', dashboardRouter);
router.use('', publicRouter);

router.get('/api/health', async (req, res, ctx) => {
  ctx.sendJson(200, { status: 'ok', time: new Date().toISOString() });
});

function applyCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', config.corsOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export async function handleRequest(req, res) {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://localhost');
  const match = router.match(req.method, url.pathname);

  if (!match) {
    sendJson(res, 404, { error: `No route for ${req.method} ${url.pathname}` });
    return;
  }

  const ctx = {
    params: match.params,
    query: Object.fromEntries(url.searchParams),
    body: undefined,
    user: undefined,
    sendJson: (statusCode, body) => sendJson(res, statusCode, body),
  };

  try {
    ctx.body = await readJsonBody(req);
    await runHandlers(match.handlers, req, res, ctx);

    if (!res.writableEnded) {
      // A handler forgot to send a response — treat it as a server bug
      // rather than leaving the client hanging.
      sendJson(res, 500, { error: 'Handler completed without sending a response' });
    }
  } catch (error) {
    if (res.writableEnded) return;

    if (error instanceof HttpError) {
      sendJson(res, error.statusCode, { error: error.message, details: error.details });
      return;
    }

    console.error('[unhandled error]', error);
    sendJson(res, 500, { error: 'Internal server error' });
  }
}
