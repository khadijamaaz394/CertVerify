import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import certRoutes from "./src/routes/certRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/certs", certRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

app.listen(5000, () => console.log("✅ Backend running on port 5000"));
