import { useState } from "react";
import TextInput from "./components/TextInput.jsx";
import SummaryDisplay from "./components/SummaryDisplay.jsx";
import KeyPointsDisplay from "./components/KeyPointsDisplay.jsx";
import MCQDisplay from "./components/MCQDisplay.jsx";
import FlashcardDisplay from "./components/FlashcardDisplay.jsx";
import SavedSets from "./components/SavedSets.jsx";
import { generateNotes } from "./api/api.js";

const TABS = ["Summary", "Key Points", "MCQs", "Flashcards"];

export default function App() {
  const [view, setView] = useState("generate"); // generate | saved
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState("Summary");
  const [refreshKey, setRefreshKey] = useState(0);
  const [resultKey, setResultKey] = useState(0); // resets MCQ/flashcard state per new result

  const showResult = (data) => {
    setResult(data);
    setResultKey((k) => k + 1);
    setTab("Summary");
    setView("generate");
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await generateNotes(text);
      showResult(data);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>IntelliNotes AI</h1>
        <p>Turn raw study text into summaries, key points, MCQs and flashcards.</p>
        <nav className="row">
          <button className={`btn ${view === "generate" ? "primary" : ""}`} onClick={() => setView("generate")}>
            Generate
          </button>
          <button className={`btn ${view === "saved" ? "primary" : ""}`} onClick={() => setView("saved")}>
            Saved Sets
          </button>
        </nav>
      </header>

      {view === "saved" && <SavedSets onOpen={showResult} refreshKey={refreshKey} />}

      {view === "generate" && (
        <>
          <TextInput text={text} setText={setText} onGenerate={handleGenerate} loading={loading} />
          {error && <div className="alert">{error}</div>}

          {result && (
            <section className="card">
              <div className="tabs">
                {TABS.map((t) => (
                  <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                    {t}
                  </button>
                ))}
              </div>
              <div key={resultKey}>
                {tab === "Summary" && <SummaryDisplay summary={result.summary} />}
                {tab === "Key Points" && <KeyPointsDisplay keyPoints={result.keyPoints} />}
                {tab === "MCQs" && <MCQDisplay mcqs={result.mcqs} />}
                {tab === "Flashcards" && <FlashcardDisplay flashcards={result.flashcards} />}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
