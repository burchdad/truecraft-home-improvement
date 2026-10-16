import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createInquiryHandler } from "./inquiry.mjs";
const root = path.resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const inquiry = createInquiryHandler();
export function createServer() {
  return http.createServer(async (req, res) => {
    const json = (status, body) => {
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      res.end(JSON.stringify(body));
    };
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    );
    try {
      const url = new URL(req.url, "http://localhost");
      if (url.pathname === "/api/inquiries") {
        if (req.method !== "POST") {
          res.setHeader("Allow", "POST");
          return json(405, { accepted: false, message: "Method not allowed." });
        }
        if (
          !/^application\/json(?:;|$)/i.test(req.headers["content-type"] || "")
        )
          return json(415, { accepted: false, message: "Expected JSON." });
        let body = "",
          bytes = 0;
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 12000)
            return json(413, {
              accepted: false,
              message: "Request too large.",
            });
          body += chunk;
        }
        let parsed;
        try {
          parsed = JSON.parse(body);
        } catch {
          return json(400, { accepted: false, message: "Invalid JSON." });
        }
        const result = await inquiry({
          body: parsed,
          origin: req.headers.origin,
          expectedOrigin: `http://127.0.0.1:${res.socket.localPort}`,
          ip: req.socket.remoteAddress,
          key: req.headers["idempotency-key"],
        });
        return json(result.status, result.body);
      }
      if (!["GET", "HEAD"].includes(req.method)) {
        res.setHeader("Allow", "GET, HEAD");
        return json(405, { accepted: false, message: "Method not allowed." });
      }
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.includes("\0"))
        return json(400, { message: "Invalid path." });
      let file = path.resolve(root, "." + pathname);
      if (!file.startsWith(root + path.sep) && file !== root)
        return json(403, { message: "Forbidden." });
      let status = 200;
      try {
        const info = await fs.stat(file);
        if (info.isDirectory()) {
          if (!pathname.endsWith("/")) {
            res.writeHead(308, { Location: pathname + "/" });
            return res.end();
          }
          file = path.join(file, "index.html");
        }
      } catch {
        file = path.join(root, "404.html");
        status = 404;
      }
      const bytes = await fs.readFile(file);
      const types = {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css",
        ".js": "text/javascript",
        ".jpg": "image/jpeg",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".txt": "text/plain",
        ".xml": "application/xml",
      };
      res.writeHead(status, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      res.end(req.method === "HEAD" ? undefined : bytes);
    } catch {
      if (!res.headersSent)
        json(400, { accepted: false, message: "Unable to process request." });
      else res.end();
    }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  createServer().listen(port, "127.0.0.1", () =>
    console.log(
      `Private local preview: http://127.0.0.1:${port} (loopback only)`,
    ),
  );
}
