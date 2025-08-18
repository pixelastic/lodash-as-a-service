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

// Main transformation endpoint
app.all('/api/transform', async (req, res) => {
  try {
    let input, chain;
    
    // Handle both GET and POST
    if (req.method === 'GET') {
      input = req.query.input;
      chain = req.query.chain;
      
      // Parse chain from query string
      if (typeof chain === 'string') {
        chain = chain.split(',').map(m => m.trim());
      }
    } else {
      input = req.body.input;
      chain = req.body.chain;
    }
    
    // Validate input
    if (input === undefined) {
      return res.status(400).json({
        error: 'Missing required parameter: input'
      });
    }
    
    if (!chain || (Array.isArray(chain) && chain.length === 0)) {
      return res.status(400).json({
        error: 'Missing required parameter: chain'
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
    
    // Validate and apply chain
    const validatedChain = validateChain(chain);
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
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Root endpoint with documentation
app.get('/', (req, res) => {
  res.json({
    name: 'Lodash as a Service',
    version: '1.0.0',
    endpoints: {
      '/api/transform': {
        methods: ['GET', 'POST'],
        description: 'Transform input using Lodash chain methods',
        examples: {
          GET: '/api/transform?input=hello_world&chain=camelCase',
          POST: {
            body: {
              input: '  hello world  ',
              chain: ['trim', 'camelCase', 'upperFirst']
            }
          }
        }
      },
      '/health': {
        methods: ['GET'],
        description: 'Health check endpoint'
      }
    },
    allowedMethods: Array.from(ALLOWED_METHODS).sort()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Lodash as a Service running on port ${PORT}`);
});