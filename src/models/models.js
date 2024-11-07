import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({}, { 
    strict: false, 
    timestamps: true 
  });
  
const DataSchema = new mongoose.Schema({}, { 
    strict: false, 
    timestamps: true 
  });
  


export const Data = mongoose.model('Data', DataSchema);
export const User = mongoose.model('User', UserSchema);
