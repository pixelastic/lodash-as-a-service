import _ from "./lodash.js";
import { LODASH_ROOT, ALLOWED_METHODS } from "./config.js";

// Main transformation logic
export function transform(path) {
  const { input, methods } = parseAndValidateRequest(path);

  // If no input or methods, return null (will show documentation)
  if (_.isNull(input) || _.isEmpty(methods)) {
    return null;
  }

  // Check if this is a generator method request (input is LODASH_ROOT)
  const result =
    input === LODASH_ROOT
      ? startWithGenerator(methods)
      : applyOnString(input, methods);

  return result;
}

// Parse and validate URL request - returns validated input and methods or throws error
// Syntax: /{input}/{method1:arg1:arg2}/{method2}/... or /_/generator:arg1:arg2/...
export function parseAndValidateRequest(path) {
  const segments = _.chain(path).trimStart("/").split("/").compact().value();

  if (_.isEmpty(segments)) {
    return { input: null, methods: [] };
  }

  // First segment is the input (URL-encoded)
  const firstSegment = decodeURIComponent(segments[0]);

  // Special case: _ means use lodash root for generator methods
  const input = firstSegment === "_" ? LODASH_ROOT : firstSegment;

  // Remaining segments are methods with optional arguments
  const methods = _.chain(segments)
    .slice(1)
    .map((segment) => {
      const parts = _.split(segment, ":");

      // Method
      const name = _.head(parts);
      if (!_.includes(ALLOWED_METHODS, name)) {
        throw new Error(`Method '${name}' is not allowed`);
      }

      // Args
      const args = _.chain(parts).slice(1).map(decodeURIComponent).value();

      return { name, args };
    })
    .value();

  return { input, methods };
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
