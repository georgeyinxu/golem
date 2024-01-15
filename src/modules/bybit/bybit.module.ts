import { FastifyInstance } from "fastify";
import { BybitInterface } from "./interfaces/bybit.interface";
import bybitSchema from "./schemas/bybit.schema";
import csvParser from "csv-parser";
import * as path from "path";
import bybitClient from "../../services/bybitClient";
import { submitWithdrawal } from "../../utils/bybit";
import prisma from "../../db/prisma";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
        data: { addresses: Array<string>; total?: number };
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

      const { addresses, totalBurn } = await new Promise<{
        addresses: string[];
        totalBurn: number;
      }>((resolve, reject) => {
        const addresses: string[] = [];
        let totalBurn: number = 0;

        file
          ?.pipe(csvParser(["address"]))
          .on("data", async (row) => {
            if (!row.address) {
              response.error = {
                code: 400,
                message: "Please ensure that CSV has address column",
              };

              return reply.status(400).send(response);
            } else {
              const amount = 1000;
              if (row.address !== "address") {
                try {
                  const response = await bybitClient.submitWithdrawal({
                    coin: "SALD",
                    chain: "ETH",
                    address: row.address,
                    amount: amount.toString(),
                    timestamp: Date.now(),
                    forceChain: 1,
                    accountType: "FUND",
                  });

                  if (!response.result.id) {
                    return reply
                      .status(500)
                      .send({ error: "Error making Bybit transaction" });
                  }

                  addresses.push(row.address);
                  totalBurn += amount;

                  const transactionId = parseInt(response.result.id);

                  await prisma.bybit.create({
                    data: {
                      address: row.address,
                      amount,
                      transactionId,
                    },
                  });

                  // TODO: Add 10 second delay
                } catch (error) {
                  return reply
                    .status(500)
                    .send({ error: "Error making Bybit transaction" });
                }
                await new Promise((resolve) => setTimeout(resolve, 10000));
              }
            }
          })
          .on("end", () => {
            resolve({ addresses, totalBurn });
          })
          .on("error", (error) => {
            reject(error);
          });
      });

      response.data.addresses = addresses;
      response.data.total = totalBurn;

      return reply.send(response);
    }
  );
}
