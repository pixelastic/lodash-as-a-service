import _ from "./lodash.js";
import { LODASH_ROOT, ALLOWED_METHODS, CHAIN_METHODS } from "./config.js";

// Parse @ functions into actual Lodash functions
function parseTransformations(methodStrings) {
  return _.map(methodStrings, methodString => {
    if (_.startsWith(methodString, "@")) {
      // Parse @fonction:arg1:arg2 syntax
      const withoutAt = methodString.slice(1);
      const parts = _.split(withoutAt, ":");
      const functionName = _.head(parts);
      const args = _.slice(parts, 1);
      
      // Return a function that applies the Lodash method with its arguments
      return (item) => _[functionName](item, ...args);
    }
    return methodString;  // Garder les strings normales
  });
}

// Validate and parse a single method
function parseMethod(methodInput) {
  // Handle array format (for POST nested methods)
  if (_.isArray(methodInput)) {
    const [name, ...args] = methodInput;
    if (!_.includes(ALLOWED_METHODS, name)) {
      throw new Error(`Method '${name}' is not allowed`);
    }
    // Keep arrays as-is (they will be processed later in applyOnString)
    return { name, args };
  }
  
  // Handle string format (for GET and simple POST)
  const parts = _.split(methodInput, ":");
  
  // Method name
  const name = _.head(parts);
  if (!_.includes(ALLOWED_METHODS, name)) {
    throw new Error(`Method '${name}' is not allowed`);
  }
  
  // Args - decode and convert numbers, and handle @ functions
  const args = _.chain(parts)
    .slice(1)
    .map(decodeURIComponent)
    .map(arg => {
      // Handle @ prefix for functions
      if (_.isString(arg) && _.startsWith(arg, "@")) {
        const functionName = arg.slice(1);
        return (item) => _[functionName](item);
      }
      
      // Convert numbers
      const num = Number(arg);
      return !isNaN(num) && arg.trim() !== "" ? num : arg;
    })
    .value();
  
  return { name, args };
}

// Parse request into common format
function parseRequest(input, methodStrings) {
  // Convert _ to LODASH_ROOT
  const parsedInput = input === "_" ? LODASH_ROOT : input;
  
  // Parse and validate methods
  const methods = _.map(methodStrings, parseMethod);
  
  return { input: parsedInput, methods };
}

// Execute transformation with parsed input and methods
function executeTransformation(input, methods) {
  // If no input or methods, return null (will show documentation)
  if (_.isNull(input) || _.isEmpty(methods)) {
    return null;
  }

  // Check if this is a generator method request (input is LODASH_ROOT)
  return input === LODASH_ROOT 
    ? startWithGenerator(methods)
    : applyOnString(input, methods);
}

// Main transformation logic for GET requests
export function transform(path) {
  const segments = _.chain(path).trimStart("/").split("/").compact().value();

  if (_.isEmpty(segments)) {
    return null;
  }

  // First segment is input, rest are methods
  const input = decodeURIComponent(segments[0]);
  const methodStrings = _.slice(segments, 1);
  
  const { input: parsedInput, methods } = parseRequest(input, methodStrings);
  return executeTransformation(parsedInput, methods);
}

// Process a JSON chain request for POST
export function processChainRequest(value, chain) {
  const { input, methods } = parseRequest(value, chain);
  return executeTransformation(input, methods);
}

// Apply generator method (like range) then chain remaining methods
export function startWithGenerator(methods) {
  const firstMethod = methods[0];
  const { name, args } = firstMethod;

  const generatedValue = _[name](...args);

  // If it's the only method, return its value
  if (methods.length == 1) {
    return generatedValue;
  }

  return applyOnString(generatedValue, methods.slice(1));
}

// Apply a chain of methods to an input value
export function applyOnString(input, methods) {
  let chainedResult = _.chain(input);

  _.forEach(methods, (method) => {
    const { name, args } = method;
    
    // Handle nested method calls (arrays) for POST requests
    const processedArgs = _.map(args, arg => {
      if (_.isArray(arg)) {
        // Check if current method supports transformation chains
        if (!_.includes(CHAIN_METHODS, name)) {
          // For non-chain methods, keep arrays as literal arguments
          return arg;
        }
        
        // For chain methods like map: create a composed function
        const transformations = parseTransformations(arg);
        return (item) => {
          let result = item;
          _.forEach(transformations, transformation => {
            if (_.isFunction(transformation)) {
              result = transformation(result);
              return;
            }
            // Handle string methods
            const parsed = parseMethod(transformation);
            result = _[parsed.name](result, ...parsed.args);
          });
          return result;
        };
      }
      
      // Handle @ functions at this level too
      if (_.isString(arg) && _.startsWith(arg, "@")) {
        const functionName = arg.slice(1);
        return (item) => _[functionName](item);
      }
      return arg;
    });
    
    chainedResult = chainedResult[name](...processedArgs);
  });

  return chainedResult.value();
}
