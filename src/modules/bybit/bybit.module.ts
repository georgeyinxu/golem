import { FastifyInstance } from "fastify";
import { BybitInterface } from "./interfaces/bybit.interface";
import bybitSchema from "./schemas/bybit.schema";

export default async function BybitModule(
  fastify: FastifyInstance
): Promise<void> {
  fastify.post<{ Body: BybitInterface }>(
    "/bybit/payout",
    bybitSchema,
    async (request, reply) => {
      const data = await request.file();
      const file = data?.file;

      console.log(data?.filename);

      reply.send(data?.filename);
    }
  );
}
