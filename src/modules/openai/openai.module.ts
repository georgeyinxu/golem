import { FastifyInstance } from "fastify";
import openAiSchema from "./schemas/openai.schema";
import { OpenAiInterface } from "./interfaces/openai.interface";
import OpenAI from "openai";
import OpenAiClient from "../../services/openAiClient";

export default async function OpenAiModule(
  fastify: FastifyInstance
): Promise<void> {
  fastify.post<{ Body: OpenAiInterface }>(
    "/openai",
    openAiSchema,
    async (request, reply) => {
      const { prompt } = request.body;
      let response: {
        error?: { code: number; message: string };
        message: string | null;
        positive: boolean;
      } = { message: "", positive: false };

      if (!process.env.OPENAI_API_KEY) {
        response.error = { code: 400, message: "Please set OPENAI API Key" };
      }

      try {
        const aiResponse = await OpenAiClient.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Is this phrase positive, please reply in either an yes or an no. ${prompt}`,
            },
          ],
        });

        response.message = aiResponse.choices[0].message.content;

        
        if (response.message?.toLowerCase().includes("yes")) {
          response.positive = true;
        }
      } catch (error: any) {
        response.error = {
          code: error.code,
          message: error.message,
        };

        return reply.status(error.code).send(error.message);
      }

      return reply.send(response);
    }
  );
}
