import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const connectDB = async () => {
    try {
       
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Mongoose Connection Success');
    } catch (error) {
        console.log('Connection Failed', error.message);
    }
};

export default connectDB;
