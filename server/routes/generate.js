const express = require("express");
const mongoose = require("mongoose");
const StudySet = require("../models/StudySet");
const { generateStudyMaterial } = require("../services/groqService");

const router = express.Router();

const MIN_CHARS = 50;
const MAX_CHARS = 12000;

// POST /api/generate  { text: string, save?: boolean, title?: string }
router.post("/", async (req, res, next) => {
  try {
    const { text, save = true, title } = req.body || {};

    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "Input cannot be empty" });
    }
    const input = String(text).trim();
    if (input.length < MIN_CHARS) {
      return res.status(400).json({ error: `Please enter at least ${MIN_CHARS} characters` });
    }
    if (input.length > MAX_CHARS) {
      return res.status(400).json({ error: `Input too long (max ${MAX_CHARS} characters)` });
    }

    const result = await generateStudyMaterial(input);

    let id = null;
    // Save only if the database is connected (readyState 1)
    if (save && mongoose.connection.readyState === 1) {
      const doc = await StudySet.create({
        title: (title && String(title).trim()) || input.slice(0, 50) + (input.length > 50 ? "..." : ""),
        inputText: input,
        ...result,
      });
      id = doc._id;
    }

    res.json({ id, ...result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
