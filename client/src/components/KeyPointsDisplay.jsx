export default function KeyPointsDisplay({ keyPoints }) {
  return (
    <div className="panel">
      <h3>Key Points</h3>
      <ul className="points">
        {keyPoints.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
