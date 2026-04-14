import  { createClient } from "redis";
import { REDIS_URI } from "../../config/config.service.js";

export const redisCLIENT = createClient({
    url:REDIS_URI
})
export const connectRedis = async()=>{
    try {
        await redisCLIENT.connect();
        console.log(`Redis Connected Successfully`);
    } catch (error) {
        console.log(`Redis Connection Failed ${error}`);
    }
}