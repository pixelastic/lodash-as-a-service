import express from "express";
import _ from "./lodash.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { marked } from "marked";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting: 100req/min
app.use(
  "/",
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
  }),
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Documentation handler - serves README.md as HTML on /
function serveDocumentation(req, res) {
  const usagePath = path.join(__dirname, "README.md");
  const markdownContent = fs.readFileSync(usagePath, "utf8");

  // Load HTML template
  const templatePath = path.join(__dirname, "template.html");
  const template = fs.readFileSync(templatePath, "utf8");

  // Convert markdown to HTML using marked
  const htmlBody = marked(markdownContent);

  // Replace placeholder with content
  const html = template.replace("{{CONTENT}}", htmlBody);

  res.type("text/html");
  res.send(html);
}
app.use((req, res, next) => {
  if (req.path == "/") {
    return serveDocumentation(req, res);
  }
  next();
});

// Whitelist of allowed Lodash methods
const ALLOWED_METHODS = [
  // String methods
  "camelCase",
  "capitalize",
  "deburr",
  "endsWith",
  "escape",
  "escapeRegExp",
  "kebabCase",
  "lowerCase",
  "lowerFirst",
  "pad",
  "padEnd",
  "padStart",
  "parseInt",
  "repeat",
  "removeEmojis",
  "replaceAll",
  "replace",
  "slice",
  "snakeCase",
  "split",
  "startCase",
  "startsWith",
  "toLower",
  "toUpper",
  "toLowerCase",
  "toUpperCase",
  "trim",
  "trimEnd",
  "trimStart",
  "truncate",
  "unescape",
  "upperCase",
  "upperFirst",
  "words",

  // Array methods
  "compact",
  "concat",
  "difference",
  "drop",
  "dropRight",
  "flatten",
  "flattenDeep",
  "head",
  "initial",
  "intersection",
  "join",
  "last",
  "reverse",
  "shuffle",
  "sort",
  "slice",
  "tail",
  "take",
  "takeRight",
  "union",
  "uniq",
  "uniqBy",
  "without",

  // Utility methods
  "identity",
  "noop",
  "range",
  "stubArray",
  "stubFalse",
  "stubObject",
  "stubString",
  "stubTrue",
  "times",
  "toPath",
  "uniqueId",
];

// Special constant for generator methods (when using _ as input)
const LODASH_ROOT = Symbol("lodash-root");

// Apply main transformation handler to all routes
app.use(mainTransformationHandler);

// Apply a chain of methods to an input value
function applyMethodChain(input, methods) {
  let chainedResult = _.chain(input);

  _.forEach(methods, (method) => {
    const { name, args } = method;
    chainedResult = chainedResult[name](...args);
  });

  return chainedResult.value();
}

// Apply generator method (like range) then chain remaining methods
function applyGeneratorMethod(methods) {
  if (_.isEmpty(methods)) {
    throw new Error("No generator method provided");
  }

  const firstMethod = methods[0];
  const { name, args } = firstMethod;

  // Call the generator method directly on lodash
  if (typeof _[name] !== "function") {
    throw new Error(`_[${name}] is not a function`);
  }

  const generatedValue = _[name](...args);

  // If there are more methods, chain them on the generated value
  if (methods.length > 1) {
    return applyMethodChain(generatedValue, methods.slice(1));
  }

  return generatedValue;
}

// Main transformation handler - parses URLs, validates methods, and applies transformations
// Entry point for all Lodash transformations via URL syntax:
// /{input}/{method1:arg1:arg2}/{method2}/... or /_/generator:arg1:arg2/...
function mainTransformationHandler(req, res, next) {
  try {
    const { input, methods } = parseAndValidateRequest(req.path);

    // If no input or methods, return documentation
    if (_.isNull(input) || _.isEmpty(methods)) {
      return serveDocumentation(req, res);
    }

    // Check if this is a generator method request (input is LODASH_ROOT)
    const result =
      input === LODASH_ROOT
        ? applyGeneratorMethod(methods)
        : applyMethodChain(input, methods);

    res.json({
      result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: _.get(error, "message", "Unknown error"),
      syntax:
        "/{input}/{method1:arg1:arg2}/{method2}/... or /_/generator:arg1:arg2/...",
    });
  }
}

// Parse and validate URL request - returns validated input and methods or throws error
// Syntax: /{input}/{method1:arg1:arg2}/{method2}/... or /_/generator:arg1:arg2/...
function parseAndValidateRequest(path) {
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

      // Method name
      const name = _.head(parts);
      if (!_.includes(ALLOWED_METHODS, name)) {
        throw new Error(`Method '${name}' is not allowed`);
      }

      // Check if method exists on chain
      const testChain = _.chain();
      if (typeof testChain[name] !== "function") {
        throw new Error(`_[${name}] is not a function`);
      }

      // Args
      const args = _.chain(parts).slice(1).map(decodeURIComponent).value();

      return { name, args: args };
    })
    .value();

  return { input, methods };
}

// Start server
app.listen(PORT, () => {
  console.log(`Lodash as a Service running on port ${PORT}`);
});
