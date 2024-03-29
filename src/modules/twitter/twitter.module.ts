import { FastifyInstance } from "fastify";
import twitterSchema from "./schemas/twitter.schema";
import { TwitterInterface } from "./interfaces/twitter.interface";
import twitterClient from "../../services/twitterClient";
import prisma from "../../db/prisma";
import { PrismaPromise } from "@prisma/client";

export default async function TwitterModule(
  fastify: FastifyInstance
): Promise<void> {
  fastify.get("/twitter/tweet", twitterSchema, async (request, reply) => {
    const mainUsernames = ["SaladVentures"];

    let response: {
      error?: { code: number; message: string };
      result: { type: "tweet" | "like" | "retweet"; success: boolean };
    } = { result: { type: "tweet", success: false } };

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

      const latestTweetsUpsert = latestTweets.data.data.map((tweet) => {
        return prisma.tweet.upsert({
          where: { tweetId: tweet.id },
          update: {},
          create: {
            tweetId: tweet.id,
            text: tweet.text,
            authorId: tweet.author_id ? tweet.author_id : "",
          },
        });
      });

      const prismaResponse = await prisma.$transaction(latestTweetsUpsert);

      if (prismaResponse) {
        response.result.success = true;
      }
    } catch (error: any) {
      response.error = { code: error.code, message: error.message };
      return reply.status(error.code).send(response);
    }

    return reply.send(response);
  });

  fastify.get("/twitter/like", twitterSchema, async (request, reply) => {
    let response: {
      error?: { code: number; message: string };
      result: { type: "tweet" | "like" | "retweet"; success: boolean };
    } = { result: { type: "like", success: false } };

    try {
      const latestTweets = await prisma.tweet.findMany();
      const likeOperations: PrismaPromise<any>[] = [];

      for (const tweet of latestTweets) {
        const twitterResponse = await twitterClient.v2.tweetLikedBy(
          tweet.tweetId
        );
        const likes = twitterResponse.data;

        if (likes) {
          for (const like of likes) {
            const accountId = like.id;
            const likeData = {
              tweetId: tweet.tweetId,
              accountId: accountId,
              likedAt: new Date(),
            };

            // Check if Account exists, if not create it
            await prisma.account.upsert({
              where: { twitterId: accountId },
              update: {},
              create: {
                twitterId: accountId,
                username: like.username || "unknown",
              },
            });

            // Upsert the like
            likeOperations.push(
              prisma.like.upsert({
                where: {
                  accountId_tweetId: {
                    accountId: accountId,
                    tweetId: tweet.tweetId,
                  },
                },
                update: { likedAt: new Date() },
                create: likeData,
              })
            );
          }
        }
      }

      if (likeOperations.length > 0) {
        await prisma.$transaction(likeOperations);
        response.result.success = true;
      }
    } catch (error: any) {
      response.error = { code: error.code, message: error.message };
      return reply.status(500).send(response);
    }

    return reply.send(response);
  });

  fastify.get("/twitter/retweet", twitterSchema, async (request, reply) => {
    let response: {
      error?: { code: number; message: string };
      result: { type: "tweet" | "like" | "retweet"; success: boolean };
    } = { result: { type: "retweet", success: false } };

    try {
      const latestTweets = await prisma.tweet.findMany();
      const retweetOperations: PrismaPromise<any>[] = [];

      for (const tweet of latestTweets) {
        const twitterResponse = await twitterClient.v2.tweetRetweetedBy(
          tweet.tweetId
        );
        const retweets = twitterResponse.data;

        if (retweets) {
          for (const retweet of retweets) {
            const accountId = retweet.id;

            // Check if Account exists, if not create it
            await prisma.account.upsert({
              where: { twitterId: accountId },
              update: {},
              create: {
                twitterId: accountId,
                username: retweet.username || "unknown",
              },
            });

            // Upsert the retweet
            retweetOperations.push(
              prisma.retweet.upsert({
                where: {
                  accountId_tweetId: {
                    accountId: accountId,
                    tweetId: tweet.tweetId,
                  },
                },
                update: { retweetedAt: new Date() },
                create: {
                  accountId: accountId,
                  tweetId: tweet.tweetId,
                  text: "",
                  retweetedAt: new Date(),
                },
              })
            );
          }
        }
      }

      if (retweetOperations.length > 0) {
        await prisma.$transaction(retweetOperations);
        response.result.success = true;
      }
    } catch (error: any) {
      response.error = { code: error.code, message: error.message };
      return reply.status(500).send(response);
    }

    return reply.send(response);
  });
}
