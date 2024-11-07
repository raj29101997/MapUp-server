import express from "express";
import { User } from "../models/models.js";
const router = express.Router();

router.get('/user-lists', async (req, res) => {
    try {
        const fetchData = await User.find().sort({ createdAt: -1 });
        let result = { users: fetchData, total: fetchData.length }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

export default router;