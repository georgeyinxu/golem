import { FastifyInstance } from "fastify";
import { BybitInterface } from "./interfaces/bybit.interface";
import bybitSchema from "./schemas/bybit.schema";
import csvParser from "csv-parser";
import * as path from "path";

export default async function BybitModule(
  fastify: FastifyInstance
): Promise<void> {
  fastify.post<{ Body: BybitInterface }>(
    "/bybit/payout",
    bybitSchema,
    async (request, reply) => {
      const data = await request.file();
      const file = data?.file;

      let response: {
        error?: { code: number; message: string };
        data: { addresses: Array<string>; total: number };
      } = { data: { addresses: [], total: 0 } };

      if (data) {
        const extension = path.extname(data?.filename);

        if (extension !== ".csv") {
          response.error = {
            code: 400,
            message: "Please ensure that the file is in CSV format",
          };

          return reply.status(400).send(response);
        }
      } else {
        response.error = {
          code: 400,
          message: "Please ensure that a file has been passed in!",
        };

        return reply.status(400).send(response);
      }

      const { addresses, totalBurn } = await new Promise<{addresses: string[], totalBurn: number }>((resolve, reject) => {
        const addresses: string[] = [];
        let totalBurn: number = 0;

        file
          ?.pipe(csvParser(["address"]))
          .on("data", (row) => {
            if (!row.address) {
              response.error = {
                code: 400,
                message: "Please ensure that CSV has address column",
              };

              return reply.status(400).send(response);
            } else {
              if (row.address !== "address") {
                addresses.push(row.address);

                totalBurn += 1000;

                // TODO: Add Bybit withdrawal functionality
              }
            }
          })
          .on("end", () => {
            resolve({ addresses, totalBurn })
          })
          .on("error", (error) => {
            reject(error)
          });
      });

      response.data.addresses = addresses;
      response.data.total = totalBurn;

      return reply.send(response)
    }
  );
}
