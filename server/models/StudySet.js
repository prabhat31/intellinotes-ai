const mongoose = require("mongoose");

const mcqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true },
  },
  { _id: false }
);

const flashcardSchema = new mongoose.Schema(
  {
    term: { type: String, required: true },
    definition: { type: String, required: true },
  },
  { _id: false }
);

const studySetSchema = new mongoose.Schema({
  title: { type: String, default: "Untitled study set" },
  inputText: { type: String, required: true },
  summary: { type: String, required: true },
  keyPoints: { type: [String], default: [] },
  mcqs: { type: [mcqSchema], default: [] },
  flashcards: { type: [flashcardSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StudySet", studySetSchema);
