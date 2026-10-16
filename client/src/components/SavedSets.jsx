import { useEffect, useState } from "react";
import { listStudySets, getStudySet, deleteStudySet } from "../api/api.js";

export default function SavedSets({ onOpen, refreshKey }) {
  const [sets, setSets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setSets(await listStudySets());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [refreshKey]);

  const open = async (id) => {
    try {
      onOpen(await getStudySet(id));
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this study set?")) return;
    try {
      await deleteStudySet(id);
      setSets(sets.filter((s) => s._id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="panel">
      <h3>Saved Study Sets</h3>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && sets.length === 0 && <p>No saved sets yet. Generate some notes first.</p>}
      <ul className="saved">
        {sets.map((s) => (
          <li key={s._id}>
            <div>
              <strong>{s.title}</strong>
              <small>{new Date(s.createdAt).toLocaleString()}</small>
            </div>
            <div className="row">
              <button className="btn" onClick={() => open(s._id)}>
                Open
              </button>
              <button className="btn danger" onClick={() => remove(s._id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
