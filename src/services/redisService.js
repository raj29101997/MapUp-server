import { redisClient } from '../config/redis.js';
import { Data } from '../models/models.js';

const client = await redisClient();

export const getCachedData =  () => {
  return new Promise( (resolve, reject) => {
    client.get('csvData', async (err, data) => {
      if (err) return reject(err);
      if (data) return resolve(JSON.parse(data));

      // Fetch from MongoDB if not cached
      const freshData = await Data.find();
      client.set('csvData', JSON.stringify(freshData), 'EX', 3600);
      resolve(freshData);
    });
  });
};

