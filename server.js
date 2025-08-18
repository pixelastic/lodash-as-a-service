const express = require('express');
const _ = require('lodash');
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
app.use('/api', limiter);

// Whitelist of allowed Lodash methods (chain-safe methods only)
const ALLOWED_METHODS = new Set([
  // String methods
  'camelCase',
  'capitalize',
  'deburr',
  'endsWith',
  'escape',
  'escapeRegExp',
  'kebabCase',
  'lowerCase',
  'lowerFirst',
  'pad',
  'padEnd',
  'padStart',
  'parseInt',
  'repeat',
  'replace',
  'snakeCase',
  'split',
  'startCase',
  'startsWith',
  'toLower',
  'toUpper',
  'trim',
  'trimEnd',
  'trimStart',
  'truncate',
  'unescape',
  'upperCase',
  'upperFirst',
  'words',
  
  // Array methods (safe ones)
  'compact',
  'concat',
  'difference',
  'drop',
  'dropRight',
  'flatten',
  'flattenDeep',
  'head',
  'initial',
  'intersection',
  'join',
  'last',
  'reverse',
  'slice',
  'tail',
  'take',
  'takeRight',
  'union',
  'uniq',
  'uniqBy',
  'without',
  
  // Object methods (safe ones)
  'keys',
  'values',
  'entries',
  'invert',
  'omit',
  'pick',
  
  // Utility methods
  'identity',
  'noop',
  'stubArray',
  'stubFalse',
  'stubObject',
  'stubString',
  'stubTrue',
  'times',
  'toPath',
  'uniqueId'
]);

// Validate chain methods
function validateChain(chain) {
  if (!Array.isArray(chain)) {
    chain = [chain];
  }
  
  for (const method of chain) {
    // Parse method name and arguments
    let methodName = method;
    let args = [];
    
    if (typeof method === 'object' && method.method) {
      methodName = method.method;
      args = method.args || [];
    } else if (typeof method === 'string') {
      // Check if method has arguments like "pick:name,age"
      const parts = method.split(':');
      methodName = parts[0];
      if (parts[1]) {
        args = parts[1].split(',').map(arg => {
          // Try to parse as JSON, otherwise keep as string
          try {
            return JSON.parse(arg);
          } catch {
            return arg.trim();
          }
        });
      }
    }
    
    if (!ALLOWED_METHODS.has(methodName)) {
      throw new Error(`Method '${methodName}' is not allowed`);
    }
  }
  
  return chain;
}

// Apply chain of Lodash methods
function applyChain(input, chain) {
  let result = input;
  
  for (const method of chain) {
    let methodName = method;
    let args = [];
    
    if (typeof method === 'object' && method.method) {
      methodName = method.method;
      args = method.args || [];
    } else if (typeof method === 'string') {
      const parts = method.split(':');
      methodName = parts[0];
      if (parts[1]) {
        args = parts[1].split(',').map(arg => {
          try {
            return JSON.parse(arg);
          } catch {
            return arg.trim();
          }
        });
      }
    }
    
    if (!_[methodName]) {
      throw new Error(`Method '${methodName}' does not exist in Lodash`);
    }
    
    // Apply the method with timeout
    const startTime = Date.now();
    result = _[methodName](result, ...args);
    
    // Timeout after 1 second per operation
    if (Date.now() - startTime > 1000) {
      throw new Error('Operation timed out');
    }
  }
  
  return result;
}

// Parse methods from URL path
function parseMethodsFromPath(path) {
  return path.replace(/^\//, '').split('/').filter(m => m);
}

// Transformation middleware
function transformMiddleware(req, res, next) {
  // Skip for root and health endpoints
  if (req.path === '/' || req.path === '/health') {
    return next();
  }
  
  try {
    let input;
    let methodsFromUrl = parseMethodsFromPath(req.path);
    
    // If no methods in URL, skip to next handler
    if (methodsFromUrl.length === 0) {
      return next();
    }
    
    // Handle GET requests - simple transformations
    if (req.method === 'GET') {
      input = req.query.input;
      
      if (input === undefined) {
        return res.status(400).json({
          error: 'Missing required query parameter: input',
          example: `${req.path}?input=hello_world`
        });
      }
      
      // Parse input if it's JSON
      try {
        if (typeof input === 'string' && (input.startsWith('{') || input.startsWith('['))) {
          input = JSON.parse(input);
        }
      } catch {
        // Keep as string if not valid JSON
      }
      
      // Simple chain without arguments
      const chain = methodsFromUrl.map(m => m);
      const validatedChain = validateChain(chain);
      const result = applyChain(input, validatedChain);
      
      res.json({
        success: true,
        input: input,
        chain: validatedChain,
        result: result
      });
      
    } 
    // Handle POST requests - complex transformations with arguments
    else if (req.method === 'POST') {
      const { input: bodyInput, args = [] } = req.body;
      input = bodyInput;
      
      if (input === undefined) {
        return res.status(400).json({
          error: 'Missing required field: input',
          example: {
            input: 'hello world',
            args: [['_', '-']]  // For replace method
          }
        });
      }
      
      // Create chain with arguments
      const chain = methodsFromUrl.map((method, index) => {
        if (args[index]) {
          return { method, args: args[index] };
        }
        return method;
      });
      
      const validatedChain = validateChain(chain);
      const result = applyChain(input, validatedChain);
      
      res.json({
        success: true,
        input: input,
        chain: validatedChain,
        result: result
      });
    } else {
      next();
    }
    
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
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
    version: '1.0.0',
    description: 'Transform data using Lodash methods via simple URLs',
    why: 'Perfect for no-code scenarios where you need simple data transformations without writing code',
    
    usage: {
      simple: {
        description: 'Chain methods directly in the URL path',
        example: 'GET /trim/camelCase?input=  hello_world  ',
        result: 'helloWorld'
      },
      complex: {
        description: 'Use POST for methods requiring arguments',
        example: {
          request: 'POST /replace/toUpper',
          body: {
            input: 'hello world',
            args: [[' ', '-'], []]
          },
          result: 'HELLO-WORLD'
        }
      }
    },
    
    examples: [
      {
        description: 'Convert to camelCase',
        url: '/camelCase?input=hello_world',
        result: 'helloWorld'
      },
      {
        description: 'Chain multiple transformations',
        url: '/trim/toLower/camelCase/upperFirst?input=  HELLO_WORLD  ',
        result: 'HelloWorld'
      },
      {
        description: 'Clean array',
        url: '/compact?input=[1,null,2,"",3,false,4]',
        result: '[1,2,3,4]'
      },
      {
        description: 'Extract unique values',
        url: '/uniq?input=[1,1,2,3,3,4]',
        result: '[1,2,3,4]'
      }
    ],
    
    httpie_examples: {
      GET: "http GET localhost:3000/trim/camelCase input=='  hello_world  '",
      POST_with_jo: "jo input='hello world' args=$(jo -a $(jo -a ' ' '-')) | http POST localhost:3000/replace/toUpper"
    },
    
    curl_examples: {
      GET: "curl 'localhost:3000/trim/camelCase?input=  hello_world  '",
      POST: "curl -X POST localhost:3000/replace -H 'Content-Type: application/json' -d '{\"input\":\"hello world\",\"args\":[[\" \",\"-\"]]}'"
    },
    
    allowedMethods: Array.from(ALLOWED_METHODS).sort(),
    
    endpoints: {
      '/[method1]/[method2]/...': 'Chain Lodash methods via URL path',
      '/health': 'Health check endpoint'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Lodash as a Service running on port ${PORT}`);
});