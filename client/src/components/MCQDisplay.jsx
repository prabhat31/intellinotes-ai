import { useState } from "react";

export default function MCQDisplay({ mcqs }) {
  const [answers, setAnswers] = useState({}); // { questionIndex: chosenIndex }
  const [submitted, setSubmitted] = useState(false);

  const score = mcqs.filter((m, i) => answers[i] === m.correctIndex).length;

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="panel">
      <h3>Practice Questions</h3>
      {mcqs.length === 0 && <p>No questions were generated. Try again.</p>}

      {mcqs.map((m, qi) => (
        <div className="mcq" key={qi}>
          <p className="q">
            {qi + 1}. {m.question}
          </p>
          {m.options.map((opt, oi) => {
            let cls = "option";
            if (answers[qi] === oi) cls += " selected";
            if (submitted && oi === m.correctIndex) cls += " correct";
            if (submitted && answers[qi] === oi && oi !== m.correctIndex) cls += " wrong";
            return (
              <label key={oi} className={cls}>
                <input
                  type="radio"
                  name={`q${qi}`}
                  disabled={submitted}
                  checked={answers[qi] === oi}
                  onChange={() => setAnswers({ ...answers, [qi]: oi })}
                />
                {opt}
              </label>
            );
          })}
        </div>
      ))}

      {mcqs.length > 0 && (
        <div className="row">
          {!submitted ? (
            <button
              className="btn primary"
              disabled={Object.keys(answers).length < mcqs.length}
              onClick={() => setSubmitted(true)}
            >
              Submit answers
            </button>
          ) : (
            <>
              <strong>
                Score: {score} / {mcqs.length}
              </strong>
              <button className="btn" onClick={reset}>
                Try again
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
