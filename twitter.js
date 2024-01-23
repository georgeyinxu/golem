const axios = require("axios");
const cron = require("node-cron");

const tweetURL = "http://localhost:3000/twitter/tweet"; 
const likeURL = "http://localhost:3000/twitter/like"; 
const retweetURL = "http://localhost:3000/twitter/retweet";

const types = ["tweet", "like", "retweet"];

let currentTypeIndex = 0;

async function callFastifyRoute(type) {
  try {
    let response;

    // TODO: Remember to add the Bearer Token to call the API's
    if (type === "tweet") {
      response = await axios.get(tweetURL);
    } else if (type === "like") {
      response = await axios.get(likeURL);
    } else if (type === "retweet") {
      response = await axios.get(retweetURL);
    }

    console.log(
      `Type: ${type}, Response: ${
        response.data.result.success ? "Success" : "Failure"
      }`
    );
  } catch (error) {
    console.error(`Error calling Fastify route for ${type}: ${error.message}`);
  }
}

function switchToNextType() {
  currentTypeIndex = (currentTypeIndex + 1) % types.length;
}

cron.schedule("*/15 * * * *", () => {
  const currentType = types[currentTypeIndex];
  callFastifyRoute(currentType);
  switchToNextType();
});
