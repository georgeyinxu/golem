import { FastifyInstance } from "fastify";
import metamaskSchema from "./schemas/metamask.schema";
import csvParser from "csv-parser";
import * as path from "path";
import { ethers } from "ethers";
import tokenAbi from "../../abi/saldTokenAbi.json";
import * as fs from "fs";
import * as stream from "stream";
import { promisify } from "util";

const finished = promisify(stream.finished);

export default async function MetamaskModule(
  fastify: FastifyInstance
): Promise<void> {
  fastify.post("/metamask/payout", metamaskSchema, async (request, reply) => {
    const data = await request.file();
    const file = data?.file;

    let response: {
      error?: { code: number; message: string };
      result: { address: string; txHash: string }[];
    } = { result: [] };

    if (!process.env.SALD_ETH_ADDR) {
      response.error = {
        code: 400,
        message: "Please set SALD_ETH_ADDR in .env.",
      };
      return reply.status(400).send(response);
    }

    if (!process.env.SALD_POS_ADDR) {
      response.error = {
        code: 400,
        message: "Please set SALD_POS_ADDR in .env.",
      };
      return reply.status(400).send(response);
    }

    if (!process.env.WALLET_PK) {
      response.error = {
        code: 400,
        message: "Please set WALLET_PK in .env.",
      };
      return reply.status(400).send(response);
    }

    // ETH
    // const node =
    //   "https://ultra-silent-research.quiknode.pro/47d5b8d5ee13ad16adeae81a46eb430a0bc48eb5/";

    // POS
    const node =
    "https://frequent-sly-morning.matic.quiknode.pro/ef44fbf18a4281b04465de0c5fbe5bb1e0d006aa/";
    const provider = new ethers.JsonRpcProvider(node);
    const privateKey = process.env.WALLET_PK;
    const wallet = new ethers.Wallet(privateKey, provider);

    const tokenContract = new ethers.Contract(
      process.env.SALD_POS_ADDR,
      tokenAbi,
      wallet
    );

    if (data) {
      const extension = path.extname(data?.filename);

      if (extension !== ".csv") {
        response.error = {
          code: 400,
          message: "Please ensure that the file is in CSV format",
        };
        return reply.status(400).send(response);
      }

      try {
        const results: { address: string; txHash: string }[] = [];

        const parseStream = csvParser(["address", "amount"]);
        const parseCSV = file!.pipe(parseStream);

        parseCSV.on("data", async (row) => {
          parseStream.pause(); // Pause the stream

          if (row.address !== "address" && row.amount !== "amount") {
            try {
              const amount = ethers.parseUnits(row.amount.toString(), 18);
              console.log(amount);

              // Wait for the transaction to complete before moving on
              const tx = await tokenContract.transfer(row.address, amount);
              const receipt = await tx.wait();
              const { hash } = receipt;
              console.log(hash);

              if (hash) {
                results.push({ address: row.address, txHash: hash });
              }
            } catch (error: any) {
              response.error = {
                code: 500,
                message: "Error making Metamask transaction",
              };
              parseStream.destroy(error);
            }
          }

          parseStream.resume();
        });

        await finished(parseCSV);
        response.result = results;
      } catch (error) {
        return reply
          .status(500)
          .send({ error: "Error processing the CSV file" });
      }
    } else {
      response.error = {
        code: 400,
        message: "Please ensure that a file has been passed in!",
      };
      return reply.status(400).send(response);
    }
    return reply.send(response);
  });
}
