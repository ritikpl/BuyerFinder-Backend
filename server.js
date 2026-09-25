import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/emails", emailRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mockMode: process.env.USE_MOCK_DATA === "true",
  });
});

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});