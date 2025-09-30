import _ from "./lodash.js";
import { LODASH_ROOT, ALLOWED_METHODS } from "./config.js";

// Parse request into common format
function parseRequest(input, methodStrings) {
  // Convert _ to LODASH_ROOT
  const parsedInput = input === "_" ? LODASH_ROOT : input;
  
  // Parse and validate methods
  const methods = _.map(methodStrings, (methodString) => {
    const parts = _.split(methodString, ":");
    
    // Method name
    const name = _.head(parts);
    if (!_.includes(ALLOWED_METHODS, name)) {
      throw new Error(`Method '${name}' is not allowed`);
    }
    
    // Args - decode and convert numbers
    const args = _.chain(parts)
      .slice(1)
      .map(decodeURIComponent)
      .map(arg => {
        const num = Number(arg);
        return !isNaN(num) && arg.trim() !== "" ? num : arg;
      })
      .value();
    
    return { name, args };
  });
  
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
    chainedResult = chainedResult[name](...args);
  });

  return chainedResult.value();
}
