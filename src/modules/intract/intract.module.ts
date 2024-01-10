import { FastifyInstance } from "fastify";
import { IntractInterface } from "./interfaces/intract.interface";
import intractSchema from "./schemas/intract.schema";
import { DateTime } from "luxon";
import axios from "axios";
import { ethers } from "ethers";

export default async function IntractModule(
  fastify: FastifyInstance
): Promise<void> {
  fastify.post<{ Body: IntractInterface }>(
    "/intract/burn",
    intractSchema,
    async (request, reply) => {
      const { address, startTimestamp, endTimestamp } = request.body;
      let response: {
        error?: { code: number; message: string };
        data: { result: boolean };
      } = { data: { result: false } };

      if (!process.env.POLYGONSCAN_API_KEY) {
        response.error = {
          code: 400,
          message: "Please ensure that POLYGONSCAN_API_KEY is set.",
        };
        return reply.status(400).send(response);
      }

      const params: {
        module: string;
        action: string;
        address: string;
        apiKey: string | undefined;
        startTimestamp?: number;
        endTimestamp?: number;
      } = {
        module: "account",
        action: "tokentx",
        address: address.toLowerCase(),
        apiKey: process.env.POLYGONSCAN_API_KEY,
      };

      if (startTimestamp) {
        params.startTimestamp = DateTime.fromISO(startTimestamp).toSeconds();
      }

      if (endTimestamp) {
        params.endTimestamp = DateTime.fromISO(endTimestamp).toSeconds();
      }

      try {
        const res = await axios.get("https://api.polygonscan.com/api", {
          params,
        });

        const transactions = res.data.result;

        if (transactions) {
          const deadWalletTransfers = transactions.filter(
            (tx: any) =>
              tx.to.toLowerCase() ===
                "0x000000000000000000000000000000000000dead" &&
              tx.tokenSymbol === "SALD" &&
              parseFloat(ethers.formatEther(tx.value)) >= 100
          );

          if (deadWalletTransfers.length > 0) {
            response.data.result = true;
          }
        }
      } catch (error: any) {
        response.error = { code: error.code, message: error.message };
      }

      return reply.send(response);
    }
  );

  fastify.post<{ Body: IntractInterface }>(
    "/intract/hold",
    intractSchema,
    async (request, reply) => {
      const { address, minAmount } = request.body;
      let response: {
        error?: { code: number; message: string };
        data: { result: boolean };
      } = { data: { result: false } };

      if (!process.env.POLYGONSCAN_API_KEY) {
        response.error = {
          code: 400,
          message: "Please ensure that POLYGONSCAN_API_KEY is set.",
        };
        return reply.status(400).send(response);
      }

      if (!minAmount) {
        response.error = {
          code: 400,
          message: "Please ensure that minAmount is set in request body.",
        };
        return reply.status(400).send(response);
      }

      try {
        const res = await axios.get("https://api.polygonscan.com/api", {
          params: {
            module: "account",
            action: "tokenbalance",
            contractaddress: "0x6A34A7284B13bA70A6135bE9738Da35C5eF22f78",
            address,
            tag: "latest",
            apikey: process.env.POLYGONSCAN_API_KEY,
          },
        });

        const balance = parseFloat(ethers.formatEther(res.data.result));

        if (balance > minAmount) {
          response.data.result = true;
        }
      } catch (error: any) {
        response.error = { code: error.code, message: error.message };
      }

      return reply.send(response);
    }
  );
}
