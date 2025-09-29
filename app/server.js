import express from "express";
import { handle as handleApi } from "./api/handler.js";
import { handle as handleDocs } from "./docs/handler.js";
import { setup } from "./middleware.js";

export const PORT = process.env.PORT || 3000;

const app = express();

// Setup all middleware
setup(app);

// Main routing logic
app.use((req, res) => {
  // If root path, serve documentation
  if (req.path === "/") {
    return handleDocs(req, res);
  }

  // Otherwise, handle as API transformation
  handleApi(req, res);
});

// Start server
app.listen(PORT, () => {
  console.log(`Lodash as a Service running on port ${PORT}`);
});

