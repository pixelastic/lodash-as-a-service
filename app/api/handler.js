import { transform } from "./transform.js";

// API handler
export function handle(req, res) {
  try {
    const result = transform(req.path);
    handleSuccess(result, res);
  } catch (error) {
    handleError(error, res);
  }
}

// Handle transformation errors
function handleError(error, res) {
  res.status(400).json({
    success: false,
    error: _.get(error, "message", "Unknown error"),
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

