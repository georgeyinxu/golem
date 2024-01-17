import { TwitterApi } from "twitter-api-v2";

const twitterClient = new TwitterApi(
  process.env.TWITTER_BEARER_TOKEN ? process.env.TWITTER_BEARER_TOKEN : ""
);

export default twitterClient;
