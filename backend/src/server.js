import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 20;

import express from "express";
import "dotenv/config";
import cors from "cors"
import cookieParser from "cookie-parser";
import authRoutes from './routes/auth.route.js'
import userRoutes from './routes/user.route.js'
import chatRoutes from './routes/chat.route.js'
import { connectDB } from './lib/db.js';


const app = express()
const PORT = process.env.PORT;


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("hello server");
})

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    connectDB();
});
