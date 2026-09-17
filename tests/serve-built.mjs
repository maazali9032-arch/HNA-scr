import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
const root = resolve("dist/client");
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".xml": "application/xml",
};
createServer(async (request, response) => {
  let path;
  try {
    path = resolve(
      root,
      "." + decodeURIComponent(new URL(request.url, "http://localhost").pathname),
    );
  } catch {
    path = root;
  }
  if (!path.startsWith(root + sep)) path = resolve(root, "index.html");
  try {
    const body = await readFile(path);
    response.setHeader("Content-Type", mime[extname(path)] || "application/octet-stream");
    response.end(body);
  } catch {
    response.setHeader("Content-Type", "text/html");
    response.end(await readFile(resolve(root, "index.html")));
  }
}).listen(4174, "127.0.0.1", () => console.log("Static build on http://127.0.0.1:4174"));
