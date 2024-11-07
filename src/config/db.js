import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const { MONGO_URL } = process.env;

export const connection =  mongoose.connect(MONGO_URL).then((conn)=>{
}).catch((err)=>{
    console.log(err)
});
