import { RouteShorthandOptions } from "fastify";

const twitterSchema: RouteShorthandOptions = {
  schema: {
    querystring: {
      
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
              type: { type: "string" },
              success: { type: "boolean" },
            },
          },
        },
      },
    },
  },
};

export default twitterSchema;
