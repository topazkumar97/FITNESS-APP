// src/tests/helpers.ts
import "dotenv/config";
import request from "supertest";
import { createServer } from "http";
import app from "../app";
import { prisma } from "../utils/prisma";

// WHY: Hono uses the Fetch API (Request/Response), not Node's http.
// Supertest only understands Node http.Server.
// We create a real Node http.Server that wraps Hono's fetch handler —
// that's the bridge Supertest needs.
const server = createServer(async (req, res) => {
  // Convert Node's IncomingMessage → Web API Request
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk);

  const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;

  const url = `http://localhost${req.url}`;
  const hasBody = body !== undefined && body.length > 0;
  const fetchRequest = new Request(url, {
    method: req.method ?? "GET",
    headers: req.headers as Record<string, string>,
    ...(hasBody && { body }),
  });

  // Let Hono handle it
  const fetchResponse = await app.fetch(fetchRequest);

  // Convert Web API Response → Node's ServerResponse
  res.statusCode = fetchResponse.status;
  fetchResponse.headers.forEach((value, key) => res.setHeader(key, value));
  const responseBuffer = await fetchResponse.arrayBuffer();
  res.end(Buffer.from(responseBuffer));
});

export const api = request(server);

// src/tests/helpers.ts — only change the loginAsTestUser function
export const loginAsTestUser = async (
  email: string,
  password = "TestPassword123"
) => {
  await api.post("/auth/signup").send({ email, password });
  const res = await api.post("/auth/login").send({ email, password });
  return res.body.accessToken as string; // ← was token, now accessToken
};

export const cleanupTestUser = async (email: string) => {
  await prisma.user.deleteMany({ where: { email } });
};
