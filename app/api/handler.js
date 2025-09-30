import { processChainRequest } from "./transform.js";

// Parse request parameters from GET or POST
function parseRequestParams(req) {
  if (req.method === "POST") {
    const { input, methods } = req.body;
    if (!input || !methods) {
      throw new Error(
        'POST body must contain "input" and "methods" properties',
      );
    }
    return { input, methods };
  }

  // GET request - parse URL path
  const segments = req.path.split("/").filter(Boolean);
  if (segments.length === 0) {
    return { input: null, methods: [] };
  }

  const input = decodeURIComponent(segments[0]);
  const methods = segments.slice(1);

  return { input, methods };
}

// API handler
export function handle(req, res) {
  try {
    const { input, methods } = parseRequestParams(req);
    const result = processChainRequest(input, methods);
    handleSuccess(result, res);
  } catch (error) {
    handleError(error, res);
  }
}

// Handle transformation errors
function handleError(error, res) {
  res.status(400).json({
    success: false,
    error: error?.message || "Unknown error",
    syntax:
      "/{input}/{method1:arg1:arg2}/{method2}/... or /_/generator:arg1:arg2/...",
  });
}

// Handle successful transformation
function handleSuccess(result, res) {
  // If transform returns null, this should be handled by documentation
  if (result === null) {
    return res.status(404).json({
      success: false,
      error: "No transformation specified",
      syntax:
        "/{input}/{method1:arg1:arg2}/{method2}/... or /_/generator:arg1:arg2/...",
    });
  }

  res.json({
    result,
  });
}
