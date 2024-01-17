import { FastifyInstance } from "fastify";
import twitterSchema from "./schemas/twitter.schema";
import { TwitterInterface } from "./interfaces/twitter.interface";
import twitterClient from "../../services/twitterClient";

export default async function TwitterModule(
  fastify: FastifyInstance
): Promise<void> {
  fastify.get<{
    Querystring: TwitterInterface;
  }>("/twitter/points", twitterSchema, async (request, reply) => {
    const { id } = request.query;

    let response: {
      error?: { code: number; message: string };
      result: { username: string; points: string };
    } = { result: { username: "", points: "" } };

    try {
        const tweet = await twitterClient.v2.user(id);
        console.log(tweet);
    } catch (error: any) {
      response.error = { code: error.code, message: error.message };
      return reply.status(error.code).send(response);
    }

    return reply.send(response);
  });
}
