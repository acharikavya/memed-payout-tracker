
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import campaignRoutes from "./routes/campaign.routes";
import { errorHandler } from "./middleware/errorHandler";
import submissionRoutes from "./routes/submission.routes";
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
  }),
);

app.use(express.json({ limit: "10kb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Meme'd Payout Tracker API is running",
  });
});
app.use("/api/auth", authRoutes);

app.use("/api/campaigns", campaignRoutes);
app.use("/api/submissions", submissionRoutes);

app.use(errorHandler);

export default app;
