import { useState } from "react";

export default function FlashcardDisplay({ flashcards }) {
  const [flipped, setFlipped] = useState({});

  const toggle = (i) => setFlipped({ ...flipped, [i]: !flipped[i] });

  return (
    <div className="panel">
      <h3>Flashcards</h3>
      <p className="hint">Click a card to flip it.</p>
      <div className="cards">
        {flashcards.map((c, i) => (
          <button
            key={i}
            className={`flashcard ${flipped[i] ? "flipped" : ""}`}
            onClick={() => toggle(i)}
          >
            <span className="face">{flipped[i] ? c.definition : c.term}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
