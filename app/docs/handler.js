import { marked } from "marked";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Documentation handler - serves README.md as HTML on /
export function handle(req, res) {
  const readmePath = path.join(__dirname, "../../README.md");
  const markdownContent = fs.readFileSync(readmePath, "utf8");

  // Load HTML template
  const templatePath = path.join(__dirname, "template.html");
  const template = fs.readFileSync(templatePath, "utf8");

  // Convert markdown to HTML
  const htmlBody = marked(markdownContent);

  // Replace placeholder with content
  const html = template.replace("{{CONTENT}}", htmlBody);

  res.type("text/html");
  res.send(html);
}
