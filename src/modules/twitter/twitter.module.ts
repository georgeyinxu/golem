import { FastifyInstance } from "fastify";
import twitterSchema from "./schemas/twitter.schema";
import { TwitterInterface } from "./interfaces/twitter.interface";
import twitterClient from "../../services/twitterClient";

export default async function TwitterModule(
  fastify: FastifyInstance
): Promise<void> {
  fastify.get<{
    Querystring: TwitterInterface;
  }>("/twitter/points", twitterSchema, async (request, reply) => {
    const { id } = request.query;

    let response: {
      error?: { code: number; message: string };
      result: { username: string; points: string };
    } = { result: { username: "", points: "" } };

    try {
      const tweetsResponse = await twitterClient.v2.userTimeline(id, {
        start_time: "2024-01-01T00:00:00Z",
        "tweet.fields": ["id", "text", "created_at"],
      });
      const tweetsFromSV = tweetsResponse.data.data;

      // TODO: Store the tweets from SV into DB

      // Getting all the replies, likes and retweets of a specific post
      tweetsFromSV.map(async (tweet) => {
        // const usersWhoLiked = await twitterClient.v2.tweetLikedBy(tweet.id, { asPaginator: true });

        // console.log(`Users Liked: ${tweet.id}`, usersWhoLiked.data);
        // const usersWhoRetweeted = await twitterClient.v2.tweetRetweetedBy(
        //   tweet.id,
        //   {
        //     asPaginator: true,
        //   }
        // );

        // console.log(
        //   `Users who re-tweeted: ${tweet.id}`,
        //   usersWhoRetweeted.data
        // );

        // TODO: How should brownie points be calculated?
      });
    } catch (error: any) {
      response.error = { code: error.code, message: error.message };
      return reply.status(error.code).send(response);
    }

    return reply.send(response);
  });
}
