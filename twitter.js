const dotenv = require("dotenv");
dotenv.config();

const cron = require("node-cron");
const { PrismaClient } = require("@prisma/client");
const { TwitterApi } = require("twitter-api-v2");

const prisma = new PrismaClient();
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

async function fetchAndStoreTweets() {
  try {
    // 1. Call the Twitter API to get the points
  } catch (error) {
    console.error(error);
  }
}

fetchAndStoreTweets();
