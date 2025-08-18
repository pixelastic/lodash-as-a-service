import express from 'express';
import _ from './lodash.js';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting: 100req/min
app.use('/', rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Root endpoint with documentation
app.get('/', (req, res) => {
  const usagePath = path.join(__dirname, 'USAGE.md');
  const usageContent = fs.readFileSync(usagePath, 'utf8');

  // Set content type to plain text
  res.type('text/plain');
  res.send(usageContent);
});

// Whitelist of allowed Lodash methods (chain-safe methods only)
const ALLOWED_METHODS = [
  // String methods
  'camelCase', 'capitalize', 'deburr', 'endsWith', 'escape', 'escapeRegExp',
  'kebabCase', 'lowerCase', 'lowerFirst', 'pad', 'padEnd', 'padStart',
  'parseInt', 'repeat', 'replace', 'replaceAll', 'slice', 'snakeCase', 'split', 'startCase',
  'startsWith', 'toLower', 'toUpper', 'toLowerCase', 'toUpperCase', 'trim', 'trimEnd', 'trimStart',
  'truncate', 'unescape', 'upperCase', 'upperFirst', 'words',

  // Array methods
  'compact', 'concat', 'difference', 'drop', 'dropRight', 'flatten',
  'flattenDeep', 'head', 'initial', 'intersection', 'join', 'last',
  'reverse', 'slice', 'tail', 'take', 'takeRight', 'union', 'uniq',
  'uniqBy', 'without',

  // Utility methods
  'identity', 'noop', 'stubArray', 'stubFalse', 'stubObject',
  'stubString', 'stubTrue', 'times', 'toPath', 'uniqueId'
];

// Apply transformation middleware to all routes
app.use(transformMiddleware);

// Validate chain methods using Lodash
function validateChain(chain) {
  if (!_.isArray(chain)) {
    chain = [chain];
  }

  _.forEach(chain, (method) => {
    // Parse method name and arguments using Lodash
    let methodName = method;
    let args = [];

    if (_.isObject(method) && _.has(method, 'method')) {
      methodName = _.get(method, 'method');
      args = _.get(method, 'args', []);
    } else if (_.isString(method)) {
      // Check if method has arguments like "pick:name,age"
      const parts = _.split(method, ':');
      methodName = _.head(parts);
      if (_.size(parts) > 1) {
        args = _.map(_.split(_.last(parts), ','), arg => {
          // Try to parse as JSON, otherwise keep as string
          try {
            return JSON.parse(arg);
          } catch {
            const trimmed = _.trim(arg);
            // Only convert to number if it looks like a pure number
            if (/^\d+(\.\d+)?$/.test(trimmed)) {
              return Number(trimmed);
            }
            return trimmed;
          }
        });
      }
    }

    if (!_.includes(ALLOWED_METHODS, methodName)) {
      throw new Error(`Method '${methodName}' is not allowed`);
    }
  });

  return chain;
}

// Apply chain of Lodash methods using Lodash for processing
function applyChain(input, chain) {
  let result = input;

  _.forEach(chain, (method) => {
    let methodName = method;
    let args = [];

    if (_.isObject(method) && _.has(method, 'method')) {
      methodName = _.get(method, 'method');
      args = _.get(method, 'args', []);
    } else if (_.isString(method)) {
      const parts = _.split(method, ':');
      methodName = _.head(parts);
      if (_.size(parts) > 1) {
        args = _.map(_.split(_.last(parts), ','), arg => {
          try {
            return JSON.parse(arg);
          } catch {
            const trimmed = _.trim(arg);
            // Only convert to number if it looks like a pure number
            if (/^\d+(\.\d+)?$/.test(trimmed)) {
              return Number(trimmed);
            }
            return trimmed;
          }
        });
      }
    }

    if (!_.has(_, methodName)) {
      throw new Error(`Method '${methodName}' does not exist in Lodash`);
    }

    // Apply the method with timeout using Lodash
    const startTime = _.now();
    result = _[methodName](result, ...args);

    // Timeout after 1 second per operation
    if (_.now() - startTime > 1000) {
      throw new Error('Operation timed out');
    }
  });

  return result;
}

// Parse input and methods from URL path using Lodash
// New syntax: /{input}/{method1:arg1:arg2}/{method2}/...
function parseInputAndMethods(path) {
  const pathWithoutLeadingSlash = _.trimStart(path, '/');
  const segments = _.compact(_.split(pathWithoutLeadingSlash, '/'));

  if (_.isEmpty(segments)) {
    return { input: null, methods: [] };
  }

  // First segment is the input (URL-encoded)
  const input = decodeURIComponent(segments[0]);

  // Remaining segments are methods with optional arguments
  const methodSegments = _.slice(segments, 1);

  const methods = _.map(methodSegments, (segment) => {
    const parts = _.split(segment, ':');
    const methodName = _.head(parts);
    const args = _.slice(parts, 1);

    if (_.isEmpty(args)) {
      return methodName;
    } else {
      // URL-decode arguments and try to convert numbers
      const decodedArgs = _.map(args, arg => {
        const decoded = decodeURIComponent(arg);
        // Only convert to number if it looks like a pure number
        if (/^\d+(\.\d+)?$/.test(decoded.trim())) {
          return Number(decoded.trim());
        }
        return decoded;
      });
      return { method: methodName, args: decodedArgs };
    }
  });

  return { input, methods };
}

// Transformation middleware using new URL syntax
// Syntax: /{input}/{method1:arg1:arg2}/{method2}/...
function transformMiddleware(req, res, next) {
  // Skip for root and health endpoints using Lodash
  const skipPaths = ['/', '/health'];
  if (_.includes(skipPaths, req.path)) {
    return next();
  }

  // Only handle GET requests with new URL syntax
  if (!_.isEqual(req.method, 'GET')) {
    return next();
  }

  try {
    const { input, methods } = parseInputAndMethods(req.path);

    // If no input or methods, skip to next handler
    if (_.isNull(input) || _.isEmpty(methods)) {
      return next();
    }

    // Validate and apply the method chain
    const validatedChain = validateChain(methods);
    const result = applyChain(input, validatedChain);

    res.json({
      success: true,
      input: input,
      chain: validatedChain,
      result: result
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: _.get(error, 'message', 'Unknown error'),
      syntax: 'Use: /{input}/{method1:arg1:arg2}/{method2}/...',
      example: '/hello%20world/camelCase'
    });
  }
}


// Start server
app.listen(PORT, () => {
  console.log(`Lodash as a Service running on port ${PORT}`);
});
