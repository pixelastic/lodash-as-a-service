const express = require('express');
const _ = require('./lodash-extensions');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later.'
});
app.use('/', limiter);

// Whitelist of allowed Lodash methods (chain-safe methods only)
// Using Lodash to organize and validate our methods
const STRING_METHODS = [
  'camelCase', 'capitalize', 'deburr', 'endsWith', 'escape', 'escapeRegExp',
  'kebabCase', 'lowerCase', 'lowerFirst', 'pad', 'padEnd', 'padStart',
  'parseInt', 'repeat', 'replace', 'replaceAll', 'slice', 'snakeCase', 'split', 'startCase',
  'startsWith', 'toLower', 'toUpper', 'toLowerCase', 'toUpperCase', 'trim', 'trimEnd', 'trimStart',
  'truncate', 'unescape', 'upperCase', 'upperFirst', 'words'
];

const ARRAY_METHODS = [
  'compact', 'concat', 'difference', 'drop', 'dropRight', 'flatten',
  'flattenDeep', 'head', 'initial', 'intersection', 'join', 'last',
  'reverse', 'slice', 'tail', 'take', 'takeRight', 'union', 'uniq',
  'uniqBy', 'without'
];

const OBJECT_METHODS = [
  'keys', 'values', 'entries', 'invert', 'omit', 'pick'
];

const UTILITY_METHODS = [
  'identity', 'noop', 'stubArray', 'stubFalse', 'stubObject',
  'stubString', 'stubTrue', 'times', 'toPath', 'uniqueId'
];

// Combine all methods using Lodash
const ALL_ALLOWED_METHODS = _.concat(STRING_METHODS, ARRAY_METHODS, OBJECT_METHODS, UTILITY_METHODS);
const ALLOWED_METHODS = new Set(ALL_ALLOWED_METHODS);

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

    if (!ALLOWED_METHODS.has(methodName)) {
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

// Apply transformation middleware to all routes
app.use(transformMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Root endpoint with documentation
app.get('/', (req, res) => {
  res.json({
    name: 'Lodash as a Service',
    version: '2.0.0',
    description: 'Transform data using Lodash methods via clean URL syntax',
    why: 'Perfect for no-code scenarios where you need simple data transformations without writing code',

    syntax: {
      pattern: '/{input}/{method1:arg1:arg2}/{method2}/...',
      rules: [
        'First segment: input string (URL-encoded if needed)',
        'Following segments: method names with optional arguments',
        'Arguments separated by colons (:)',
        'Everything URL-encoded if contains special chars'
      ]
    },

    examples: [
      {
        description: 'Simple camelCase transformation',
        url: '/hello_world/camelCase',
        result: 'helloWorld'
      },
      {
        description: 'Chain multiple transformations',
        url: '/user_first_name/replace:_:%20/camelCase',
        result: 'userFirstName'
      },
      {
        description: 'Text with spaces (URL-encoded)',
        url: '/hello%20world/trim/camelCase/upperFirst',
        result: 'HelloWorld'
      },
      {
        description: 'String manipulation with arguments',
        url: '/hello/padStart:10:*/truncate:8',
        result: '*****hel'
      },
      {
        description: 'Array operations (via split)',
        url: '/1,2,null,3,,4/split:,/compact/join:,',
        result: '1,2,null,3,4'
      }
    ],

    httpie_examples: [
      "http GET localhost:3000/hello_world/camelCase",
      "http GET localhost:3000/user%20name/replace:%20:_/camelCase",
      "http GET localhost:3000/1,2,3,1,2/split:,/uniq/join:,"
    ],

    curl_examples: [
      "curl 'localhost:3000/hello_world/camelCase'",
      "curl 'localhost:3000/user%20name/replace:%20:_/camelCase'",
      "curl 'localhost:3000/text/padStart:10:*/truncate:8'"
    ],

    allowedMethods: _.sortBy(Array.from(ALLOWED_METHODS)),

    endpoints: {
      '/{input}/{methods...}': 'Transform input using chained Lodash methods',
      '/health': 'Health check endpoint'
    },

    encoding: {
      space: '%20',
      colon: '%3A',
      slash: '%2F',
      comma: '%2C',
      note: 'URL-encode special characters if they appear in your input or arguments'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Lodash as a Service running on port ${PORT}`);
});
