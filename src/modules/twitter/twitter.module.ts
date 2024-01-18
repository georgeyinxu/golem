import { FastifyInstance } from "fastify";
import twitterSchema from "./schemas/twitter.schema";
import { TwitterInterface } from "./interfaces/twitter.interface";
import twitterClient from "../../services/twitterClient";
import prisma from "../../db/prisma";

export default async function TwitterModule(
  fastify: FastifyInstance
): Promise<void> {
  fastify.get<{
    Querystring: TwitterInterface;
  }>("/twitter/scrape", twitterSchema, async (request, reply) => {
    const { id } = request.query;
    const mainUsernames = ["SaladVentures"];

    let response: {
      error?: { code: number; message: string };
      result: { username: string; points: string };
    } = { result: { username: "", points: "" } };

    try {
      // 1. Get the latest Tweets from SV
      const saladAccount = await prisma.account.findFirst({
        where: { username: mainUsernames[0] },
      });

      if (!saladAccount) {
        throw new Error("Salad Ventures account not found");
      }

      const latestTweets = await twitterClient.v2.userTimeline(
        saladAccount.twitterId,
        {
          start_time: "2024-01-01T00:00:00Z",
          "tweet.fields": ["id", "text", "created_at", "author_id"],
        }
      );

      // const latestTweetsUpsert = latestTweets.data.data.map(tweet => {
      //   return prisma.tweet.upsert({
      //     where: { tweetId: tweet.id },
      //     update: {},
      //     create: {
      //       tweetId: tweet.id,
      //       text: tweet.text,
      //       authorId: tweet.author_id,
      //     }
      //   })
      // })

      // await prisma.$transaction(latestTweetsUpsert);
    } catch (error: any) {
      response.error = { code: error.code, message: error.message };
      return reply.status(error.code).send(response);
    }

    return reply.send(response);
  });
}
