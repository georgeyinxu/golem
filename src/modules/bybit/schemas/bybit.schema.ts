import { RouteShorthandOptions } from "fastify";

const bybitSchema: RouteShorthandOptions = {
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
          data: {
            type: "object",
            properties: {
              addresses: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
          },
        },
        required: ["data"],
      },
    },
  },
};

export default bybitSchema;