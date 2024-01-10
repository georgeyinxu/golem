import { RouteShorthandOptions } from "fastify";

const depositsSchema: RouteShorthandOptions = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        address: { type: "string" },
        twitter: { type: "string" },
        discord: { type: "string" },
        telegram: { type: "string" },
        email: { type: "string" },
        startTimestamp: { type: "string" },
        endTimestamp: { type: "string" },
      },
      required: ["address"],
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
          data: {
            type: "object",
            properties: {
              result: {
                type: "boolean",
              },
            },
          },
        },
        required: ["data"],
      },
    },
  },
};

export default depositsSchema;
