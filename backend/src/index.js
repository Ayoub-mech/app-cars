import express from "express";
import "dotenv/config";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { connectDB } from "./lib/db.js";
import carRoutes from "./routes/carRoutes.js"
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(cors());
app.use("/api/auth",authRoutes)
app.use("/api/cars", carRoutes);
 
app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})