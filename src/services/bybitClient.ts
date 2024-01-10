import { RestClientV5 } from "bybit-api";

const bybitClient = new RestClientV5({
    testnet: false,
    key: process.env.BYBIT_API_KEY,
    secret: process.env.BYBIT_API_SECRET,
})

export default bybitClient;