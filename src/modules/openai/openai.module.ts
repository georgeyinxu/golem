import { FastifyInstance } from 'fastify';
import openAiSchema from './schemas/openai.schema';
import { OpenAiInterface } from './interfaces/openai.interface';

export default async function OpenAiModule(fastify: FastifyInstance): Promise<void> {
    fastify.post<{Body: OpenAiInterface}>("/openai", openAiSchema, async (request, reply) => {
        const { prompt } = request.body;
    });
}