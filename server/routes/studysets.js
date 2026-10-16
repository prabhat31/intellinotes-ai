const express = require("express");
const mongoose = require("mongoose");
const StudySet = require("../models/StudySet");

const router = express.Router();

function requireDb(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: "Database not connected" });
  }
  next();
}

function validId(req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "Invalid study set id" });
  }
  next();
}

// GET /api/studysets - list (without the long input text)
router.get("/", requireDb, async (req, res, next) => {
  try {
    const sets = await StudySet.find().select("-inputText").sort({ createdAt: -1 });
    res.json(sets);
  } catch (e) {
    next(e);
  }
});

// GET /api/studysets/:id
router.get("/:id", requireDb, validId, async (req, res, next) => {
  try {
    const set = await StudySet.findById(req.params.id);
    if (!set) return res.status(404).json({ error: "Study set not found" });
    res.json(set);
  } catch (e) {
    next(e);
  }
});

// DELETE /api/studysets/:id
router.delete("/:id", requireDb, validId, async (req, res, next) => {
  try {
    const deleted = await StudySet.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Study set not found" });
    res.json({ message: "Deleted" });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
