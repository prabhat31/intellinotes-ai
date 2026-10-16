const MIN = 50;
const MAX = 12000;

export default function TextInput({ text, setText, onGenerate, loading }) {
  const len = text.trim().length;
  const tooShort = len < MIN;
  const tooLong = len > MAX;

  return (
    <section className="card">
      <label htmlFor="study-text" className="label">
        Paste your study material
      </label>
      <textarea
        id="study-text"
        rows={10}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste notes, a textbook paragraph, or any topic text here..."
        disabled={loading}
      />
      <div className="row between">
        <span className={tooLong ? "count error" : "count"}>
          {len} / {MAX} characters {tooShort && len > 0 ? `(min ${MIN})` : ""}
        </span>
        <button className="btn primary" onClick={onGenerate} disabled={loading || tooShort || tooLong}>
          {loading ? "Generating..." : "Generate Notes"}
        </button>
      </div>
    </section>
  );
}
