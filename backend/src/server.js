import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import boardRoutes from "./routes/boardRoutes.js";


dotenv.config();

const app=express();

app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/boards", boardRoutes);


app.get("/",(req,res)=>{
    res.send("API is running");
});

const port=process.env.PORT || 5000;

const startServer=async()=>{
    try {
        await connectDB();
        app.listen(port,()=>{
            console.log(`Server is running on port ${port}`);
        });
    }
    
    catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1);
    }
};

startServer();