const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data;
}

export const generateNotes = (text, title) =>
  request("/api/generate", {
    method: "POST",
    body: JSON.stringify({ text, title, save: true }),
  });

export const listStudySets = () => request("/api/studysets");
export const getStudySet = (id) => request(`/api/studysets/${id}`);
export const deleteStudySet = (id) => request(`/api/studysets/${id}`, { method: "DELETE" });
