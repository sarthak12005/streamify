// lib/db.js
import mongoose from 'mongoose';
import "dotenv/config";


export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");
    } catch (err) {
        console.log("❌ Error connecting to MongoDB:", err);
        process.exit(1); // Stop the server if DB fails
    }
};
