require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const generateRoute = require("./routes/generate");
const studySetsRoute = require("./routes/studysets");

const app = express();

// Allow one or more comma-separated origins (e.g. localhost + your Vercel URL)
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => res.json({ status: "ok", app: "IntelliNotes AI API" }));
app.use("/api/generate", generateRoute);
app.use("/api/studysets", studySetsRoute);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

async function start() {
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("MongoDB connected");
    } catch (e) {
      console.warn("MongoDB connection failed. Saving will be disabled:", e.message);
    }
  } else {
    console.warn("MONGO_URI not set. Saving will be disabled.");
  }
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
