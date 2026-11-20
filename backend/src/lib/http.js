// Tiny dependency-free HTTP helpers: a route matcher with :param support,
// JSON body parsing, and a typed error class so handlers can just
// `throw new HttpError(404, 'Animal not found')` and let the app handle it.

export class HttpError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2MB is plenty for this API.

export function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const contentType = req.headers['content-type'] || '';
    if (req.method === 'GET' || req.method === 'DELETE') {
      resolve(undefined);
      return;
    }

    const chunks = [];
    let totalBytes = 0;

    req.on('data', (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > MAX_BODY_BYTES) {
        reject(new HttpError(413, 'Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) {
        resolve(undefined);
        return;
      }

      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw.trim()) {
        resolve(undefined);
        return;
      }

      if (!contentType.includes('application/json')) {
        reject(new HttpError(415, 'Content-Type must be application/json'));
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new HttpError(400, 'Request body is not valid JSON'));
      }
    });

    req.on('error', reject);
  });
}

// Converts a path pattern like '/api/animals/:id/medical' into a regex plus
// the ordered list of param names it captures.
function compilePattern(pattern) {
  const paramNames = [];
  const regexBody = pattern
    .split('/')
    .map((segment) => {
      if (segment.startsWith(':')) {
        paramNames.push(segment.slice(1));
        return '([^/]+)';
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('/');

  return { regex: new RegExp(`^${regexBody}$`), paramNames };
}

export class Router {
  constructor() {
    this.routes = [];
  }

  #add(method, pattern, ...handlers) {
    const { regex, paramNames } = compilePattern(pattern);
    this.routes.push({ method, regex, paramNames, handlers });
    return this;
  }

  get(pattern, ...handlers) {
    return this.#add('GET', pattern, ...handlers);
  }

  post(pattern, ...handlers) {
    return this.#add('POST', pattern, ...handlers);
  }

  patch(pattern, ...handlers) {
    return this.#add('PATCH', pattern, ...handlers);
  }

  delete(pattern, ...handlers) {
    return this.#add('DELETE', pattern, ...handlers);
  }

  // Merges another router's routes under an optional prefix, so route
  // modules can be composed together in app.js.
  use(prefix, otherRouter) {
    for (const route of otherRouter.routes) {
      const fullPattern = prefix + route.regex.source.slice(1, -1); // strip ^...$
      this.routes.push({
        method: route.method,
        regex: new RegExp(`^${fullPattern}$`),
        paramNames: route.paramNames,
        handlers: route.handlers,
      });
    }
    return this;
  }

  match(method, pathname) {
    for (const route of this.routes) {
      if (route.method !== method) continue;
      const result = route.regex.exec(pathname);
      if (!result) continue;

      const params = {};
      route.paramNames.forEach((name, index) => {
        params[name] = decodeURIComponent(result[index + 1]);
      });

      return { handlers: route.handlers, params };
    }
    return null;
  }
}

// Runs a chain of (req, res, ctx) handlers in order. Any handler may be
// async; any handler may short-circuit by sending a response itself
// (checked via res.writableEnded).
export async function runHandlers(handlers, req, res, ctx) {
  for (const handler of handlers) {
    if (res.writableEnded) return;
    await handler(req, res, ctx);
  }
}
