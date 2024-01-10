// Packages
import * as dotenv from "dotenv";
dotenv.config();

import fastify, { FastifyInstance } from "fastify";
import { fastifyPostgres } from "@fastify/postgres";
import multipart from "@fastify/multipart";
import cors from "@fastify/cors";

// Modules
import { BybitModule, IntractModule } from "./modules";

// Middlewares
import securityMiddleware from "./middlewares/security.middleware";

// Plugins

const serializers = {
  req(request: any) {
    let clientId;
    if (
      request.headers.authorization != undefined &&
      request.headers.authorization.includes("Bearer")
    ) {
      clientId = findClientIdFromHeaders(request.headers.authorization);
    }
    return {
      method: request.method,
      url: request.url,
      clientId,
      remoteAddress: request.ip,
      remotePort: request.socket.remotePort,
      host: request.hostname,
    };
  },
};

const envToLogger = {
  development: {
    serializers,
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: {
    serializers,
  },
  test: false,
};

const env = process.env.NODE_ENV || "development";
const app: FastifyInstance = fastify({
  logger: envToLogger[env as keyof typeof envToLogger] ?? true,
});

// Database connection
app.register(fastifyPostgres, {
  connectionString: process.env.DATABASE_URL,
});

// CORS
app.register(cors, {
  origin: "*",
});

// Multipart
app.register(multipart);

// Security Middleware
app.addHook("onRequest", securityMiddleware);

app.get("/", async (request, reply) => {
  return "Ok";
});

app.get("/health", async (request, reply) => {
  // Query the database to check if it's connected
  const client = await app.pg.connect();
  await client.query("SELECT 1");
  client.release();
  return "Everything is ok";
});

// Register module
app.register(IntractModule);
app.register(BybitModule);

app.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

const findClientIdFromHeaders = (headers: string) => {
  // Check if the token is the same as the security keys from .env
  const token = headers.split(" ")[1];
  const securityKeys = JSON.parse(process.env.SECURITY_KEYS || "[]");
  const securityKeyObject = securityKeys.find(
    (o: { id: string; key: string }) => o.key === token
  );

  return securityKeyObject.id;
};
