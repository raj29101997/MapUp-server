import redis from 'redis';

export const redisClient = async () => {
    const createClient = redis.createClient()
    createClient.on("connect", (e) => {
        console.log("Redis connection created!");
    });
    createClient.on("error", (err) => {
        console.log("Error in the Connection");
    });
    await createClient.connect()
    return createClient
}