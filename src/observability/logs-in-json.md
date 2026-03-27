# Logs in JSON

## Why JSON Logging?

**Plain text logs** (`User john_doe logged in at 10:30`) require regex parsing to extract data, are slow to query, and don't scale well in distributed systems.

**JSON logs** are machine-readable, queryable by field, and integrate seamlessly with modern observability platforms.

| Feature | JSON | Plain Text |
|---------|------|------------|
| Parsing | Fast (native parsers) | Slow (regex needed) |
| Querying | By field/index | Full-text only |
| Tools Integration | Excellent | Limited    |
| Microservices | Easy correlation | Manual work |
| Extensibility | Add fields freely | Format breaks |

## Installation

```bash
npm install pino
npm install --save-dev pino-pretty @types/pino
```

## Basic Setup

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
});

logger.info('Application started');
logger.warn('High memory usage');
logger.error('Database failed');
```


Output:

```json
{
  "level": 30,
  "time": "2023-12-12T10:30:00.000Z",
  "pid": 12345,
  "hostname": "api-server",
  "msg": "Application started"
}
```

## Structured Logging (The Key Feature)

Instead of string concatenation, pass objects with context:

```typescript
logger.info({
  userId: '12345',
  action: 'login',
  ipAddress: '192.168.1.1',
  duration: 245,
}, 'User login successful');
```

Output:

```json
{
  "level": 30,
  "time": "2023-12-12T10:30:00.000Z",
  "userId": "12345",
  "action": "login",
  "ipAddress": "192.168.1.1",
  "duration": 245,
  "msg": "User login successful"
}
```

Now each field is queryable: `userId:12345 AND action:login`

## Child Loggers (For Request Context)

Child loggers automatically include context in all subsequent logs:

```typescript
import pino from 'pino';
import { Request, Response, NextFunction } from 'express';

const logger = pino();

function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  
  // Create child logger with request context
  req.logger = logger.child({
    requestId,
    userId: req.headers['x-user-id'],
    method: req.method,
    path: req.path,
  });
  
  req.logger.info('Request started');
  next();
}

app.get('/api/users/:id', requestLogger, async (req, res) => {
  req.logger.info('Fetching user');  // requestId is auto-included
  
  try {
    const user = await getUser(req.params.id);
    req.logger.info({ user }, 'User retrieved');
    res.json(user);
  } catch (error) {
    req.logger.error({ err: error }, 'Failed to fetch user');
    res.status(500).json({ error: 'Internal error' });
  }
});
```

All logs now include `requestId` automatically—perfect for tracing requests through distributed systems.

## Error Logging

Pino automatically captures stack traces:

```typescript
async function processPayment(orderId: string, amount: number) {
  try {
    logger.info({ orderId, amount }, 'Processing payment');
    const result = await paymentGateway.charge(orderId, amount);
    logger.info({ transactionId: result.id }, 'Payment successful');
    return result;
  } catch (error) {
    logger.error({ err: error, orderId, amount }, 'Payment failed');
    throw error;
  }
}
```

Output includes full stack trace:

```json
{
  "level": 50,
  "time": "2023-12-12T10:30:00.000Z",
  "err": {
    "type": "PaymentError",
    "message": "Gateway timeout",
    "stack": "PaymentError: Gateway timeout\n    at processPayment...\n    ..."
  },
  "orderId": "order-123",
  "amount": 99.99,
  "msg": "Payment failed"
}
```

## Production Configuration

```typescript
import pino from 'pino';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

const logger = pino(
  {
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
    
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
      bindings: (bindings) => ({
        pid: bindings.pid,
        host: bindings.hostname,
        env: process.env.NODE_ENV,
      }),
    },
    
    timestamp: pino.stdTimeFunctions.isoTime,
    
    // Remove sensitive fields
    redact: {
      paths: ['password', 'creditCard', 'token', '*.apiKey'],
      remove: true,
    },
  },
  
  // Pretty in dev, file in prod
  isDev
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      }
    : pino.destination({
        dest: path.join(__dirname, 'logs', 'app.log'),
        sync: false,
      })
);

export default logger;
```

**Key features**:

* Dynamic log levels via `LOG_LEVEL` env var
* Sensitive data redaction (passwords, tokens)
* Pretty printing in development
* Async file writes in production (no event loop blocking)

## Correlation IDs (Microservices)

Track requests across multiple services:

```typescript
function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  
  req.logger = logger.child({ correlationId, service: 'api-gateway' });
  res.setHeader('x-correlation-id', correlationId);
  
  next();
}

// Propagate to downstream services
async function callPaymentService(req: Request, orderId: string) {
  req.logger.info({ orderId }, 'Calling payment service');
  
  const response = await fetch('https://payment-service/api/charge', {
    headers: {
      'x-correlation-id': req.correlationId,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ orderId }),
  });
  
  req.logger.info({ statusCode: response.status }, 'Payment service responded');
  return response;
}
```

Query all logs for a request: `correlationId:abc-123-def` across all services.

## Best Practices

✅ **Do:**

* Use structured context with objects, not string concatenation
* Include correlation IDs for distributed tracing
* Use appropriate log levels (DEBUG for dev, INFO for prod)
* Redact sensitive data (passwords, tokens, SSNs)
* Log errors with full context, including the error object
* Use child loggers for request-scoped context
* Enable dynamic log level changes at runtime

❌ **Don't:**

* Log sensitive information (PII, credentials, API keys)
* Use string concatenation for context
* Log at DEBUG level in production
* Ignore errors—always log them with the error object
* Create a new logger for each request (use child loggers)

## Performance

Pino is **fast**:

* 2.4x faster than Winston
* 3.3x faster than Bunyan
* \~115ms per log message with full serialization

JSON logs are **10-30% larger** than plain text but compress to **80-90% smaller** with gzip.

## Summary

| What | Why |
|------|-----|
| Use JSON | Structured, queryable, tool-friendly |
| Use Pino | Fast, featureful, TypeScript-ready |
| Use child loggers | Auto-include context in all logs |
| Use correlation IDs | Trace requests across services |
| Use structured data | Makes logs searchable and analyzable |
| Redact sensitive data | Protect PII and credentials |

**Result**: Fast troubleshooting, better observability, searchable logs across all services.