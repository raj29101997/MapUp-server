import express from 'express';
import { upload } from '../utils/middleware.js';
import { processCsvFile } from '../services/csvservices.js';
import { redisClient } from '../config/redis.js';
import { Data } from '../models/models.js';

const router = express.Router();

// CSV Upload Endpoint
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        await processCsvFile(req.file.path);
        res.status(202).json({ message: 'File received and processing started.' });
    } catch (error) {
        res.status(500).json({ message: 'Error processing file', error });
    }
});

// Data CRUD Endpoints
router.post('/transactions', async (req, res) => {
    const client = await redisClient();
    try {
        const { id,
            VendorID,
            tpep_pickup_datetime,
            tpep_dropoff_datetime,
            passenger_count,
            trip_distance,
            RatecodeID,
            store_and_fwd_flag,
            PULocationID,
            DOLocationID,
            payment_type,
            fare_amount,
            extra,
            mta_tax,
            tip_amount,
            tolls_amount,
            improvement_surcharge,
            total_amount,
            congestion_surcharge,
            Airport_fee } = req.body.body;

        const action = req.body.action;
        if (action === 'UpdateData') {
            const data = ({
                VendorID,
                tpep_pickup_datetime,
                tpep_dropoff_datetime,
                passenger_count,
                trip_distance,
                RatecodeID,
                store_and_fwd_flag,
                PULocationID,
                DOLocationID,
                payment_type,
                fare_amount,
                extra,
                mta_tax,
                tip_amount,
                tolls_amount,
                improvement_surcharge,
                total_amount,
                congestion_surcharge,
                Airport_fee
            });
            await Data.findOneAndUpdate({ "_id": id }, data)
            await client.del('csvData');
            res.status(201).json({ message: 'Document updated successfully', status: 201 });
        } else if (action === 'DeleteData') {
            const data = ({ id });
            await Data.findOneAndDelete({ "_id": id }, data)
            await client.del('csvData');
            res.status(201).json({ message: 'Document deleted successfully', status: 201 });
        } else {
            const data = new Data({
                VendorID,
                tpep_pickup_datetime,
                tpep_dropoff_datetime,
                passenger_count,
                trip_distance,
                RatecodeID,
                store_and_fwd_flag,
                PULocationID,
                DOLocationID,
                payment_type,
                fare_amount,
                extra,
                mta_tax,
                tip_amount,
                tolls_amount,
                improvement_surcharge,
                total_amount,
                congestion_surcharge,
                Airport_fee
            });
            await data.save();
            res.status(201).json({ message: 'Document inserted successfully', status: 201 });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', status: 401 });
    }
});

// Fetch Data Endpoint
router.get('/fetch-data', async (req, res) => {
    try {
        const client = await redisClient();
        let cachedData = await client.get('csvData');
        if (!cachedData) {
            let fetchData = await Data.find().sort({ createdAt: -1 });
            if (fetchData.length < 1) {
                return res.status(200).json({ records: [], total: 0 });
            }
            await client.set('csvData', JSON.stringify(fetchData), 'EX', 3600);
            cachedData =  await client.get('csvData');
        }
     
        let result = { records: JSON.parse(cachedData), total: JSON.parse(cachedData).length }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

export default router;