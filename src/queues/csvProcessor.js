import Queue from 'bull';
import fs from 'fs';
import csv from 'csv-parser'
import { Data } from '../models/models.js';
import { redisClient } from '../config/redis.js';

// Create queue
const csvQueue = new Queue('csvQueue', {
  redis: { host: '127.0.0.1', port: 6379 },
});

// Worker to process CSV data
csvQueue.process(async (job) => {
  const { filePath } = job.data;
  const results = [];
  const client = await redisClient();

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          if (data.VendorID) {
            results.push(data);
          }
        })
        .on('end', async () => {
          try {
            if (results.length > 0) {
              await Data.insertMany(results);
              Data.find().sort({ createdAt: -1 }).then((result) => {
                fs.unlinkSync(filePath);
                client.set('csvData', JSON.stringify(result), 'EX', 3600);
              })
            }
            resolve();
          } catch (dbError) {
            reject(dbError);
          }
        })
        .on('error', (fileError) => {
          reject(fileError);
        });
    });
  } catch (err) {
    throw err;
  }
});

export default csvQueue;