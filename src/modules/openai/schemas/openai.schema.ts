import { RouteShorthandOptions } from "fastify";

const openAiSchema: RouteShorthandOptions = {
  schema: {
    body: {
      type: "object",
      properties: {
        prompt: { type: "string" },
      },
      required: ["prompt"]
    },
    response: {
      200: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: {
                type: "integer",
              },
              message: {
                type: "string",
              },
            },
          },
          message: {
            type: "string",
          },
        },
      },
    },
  },
};

export default openAiSchema;
