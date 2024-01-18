const dotenv = require("dotenv");
dotenv.config();

const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const { TwitterApi } = require("twitter-api-v2");

const prisma = new PrismaClient();
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

async function fetchAndStoreTweets() {
  try {
    const mainUsernames = ["felixsim", "saladventures", "arcadenofficial"];

    // 1. Add Twitter Accounts to Account Table
    // const accounts = await twitterClient.v2.usersByUsernames(mainUsernames, {
    //   "user.fields": [
    //     "id",
    //     "created_at",
    //     "description",
    //     "location",
    //     "public_metrics",
    //     "verified",
    //   ],
    // });

    // const mainAccountUpserts = accounts.data.map((data) => {
    //   return prisma.account.upsert({
    //     where: { twitterId: data.id },
    //     update: {
    //       username: data.username,
    //       followerCount: data.public_metrics.followers_count,
    //       followingCount: data.public_metrics.following_count,
    //       verified: data.verified,
    //     },
    //     create: {
    //       username: data.username,
    //       twitterId: data.id,
    //       followerCount: data.public_metrics.followers_count,
    //       followingCount: data.public_metrics.following_count,
    //       verified: data.verified,
    //     },
    //   });
    // });

    // await prisma.$transaction(mainAccountUpserts);

    // 2. Get the latest Tweets from SV
    const saladAccount = await prisma.account.findFirst({
      where: { username: "SaladVentures" },
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

    // 3. Get those who have liked the tweet

    latestTweets.data.data.map(async (tweet) => {
      const userLikes = await twitterClient.v2.tweetLikedBy(tweet.id, {
        asPaginator: true,
      });

      console.log(userLikes.data);

      // const userAccountsUpsert = userLikes.data.data.map(async (user) => {
      //   const existingLike = await prisma.like.findUnique({
      //     where: {
      //       accountId_tweetId: { accountId: user.id, tweetId: tweet.id },
      //     },
      //   });

      //   if (!existingLike) {
      //     await prisma.account.upsert({
      //       where: { twitterId: user.id },
      //       create: { twitterId: user.id, username: user.username },
      //       update: {},
      //     });

      //     await prisma.like.create({
      //       data: {
      //         accountId: user.id,
      //         tweetId: tweet.id,
      //       }
      //     })
      //   }
        
      // });

      // await prisma.$transaction(userAccountsUpsert);

      return;
    });
  } catch (error) {
    console.error(error);
  }
}

fetchAndStoreTweets();
