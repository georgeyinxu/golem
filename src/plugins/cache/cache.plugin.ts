import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { IOption } from "./option.interface";
import fastifyRedis from "@fastify/redis";
import fastifyPlugin from "fastify-plugin";
import fastifyUrlData from "@fastify/url-data";

export default fastifyPlugin(
  async (fastify: FastifyInstance, options: IOption) => {
    fastify.register(fastifyUrlData);
    fastify.register(fastifyRedis, { url: process.env.REDIS_URL });

    // Register hook to check if the route is in the list
    fastify.addHook(
      "onRequest",
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          const urlData = request.urlData();
          const path = urlData.path || ""; // Set a default value if path is undefined
          const isRouteCached = options.routes.some(
            (route) => route.path === path
          );
          if (isRouteCached) {
            const cached = await fastify.redis.get(request.url);
            if (cached) {
              reply.send(JSON.parse(cached));
            }
          }
        } catch (error) {
          fastify.log.error(error, "Error in onRequest hook");
          reply.code(500).send({ error: "Internal Server Error" });
        }
      }
    );

    // Register hook to save the response in the cache
    fastify.addHook(
      "onSend",
      async (request: FastifyRequest, reply: FastifyReply, payload: any) => {
        try {
          const urlData = request.urlData();
          const picked = options.routes.find((o) => o.path === urlData.path);
          if (picked) {
            await fastify.redis.set(
              request.url,
              JSON.stringify(payload),
              "EX",
              picked.ttl
            );
          }
        } catch (error) {
          fastify.log.error(error, "Error in onSend hook");
        }
      }
    );
  }
);
