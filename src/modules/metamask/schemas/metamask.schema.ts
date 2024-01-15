import { RouteShorthandOptions } from "fastify";

const metamaskSchema: RouteShorthandOptions = {
  schema: {
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
            type: "array",
            items: {
              type: "object",
              properties: {
                address: { type: "string" },
                txHash: { type: "string" },
              },
            },
          },
        },
        // required: ["result"],
      },
    },
  },
};

export default metamaskSchema;
