import { RouteShorthandOptions } from "fastify";

const twitterSchema: RouteShorthandOptions = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
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
          result: {
            type: "object",
            properties: {
              username: { type: "string" },
              points: { type: "string" },
            },
          },
        },
      },
    },
  },
};

export default twitterSchema;
