# IntelliNotes AI

IntelliNotes AI turns study material into a concise summary, key points, multiple-choice questions, and flashcards. Paste text into the React app, generate study aids with the Groq API, and optionally save and revisit study sets with MongoDB.

## Features

- Generate a summary, key points, five multiple-choice questions, and flashcards from supplied study text.
- Answer generated multiple-choice questions and review flashcards in the browser.
- Optionally save, reopen, and delete generated study sets.
- Validate input length before sending it to the API (50–12,000 characters).

## Technology

- **Frontend:** React 18, Vite 8
- **Backend:** Node.js, Express
- **AI:** Groq chat completions API (default model: `llama-3.1-8b-instant`)
- **Optional persistence:** MongoDB with Mongoose

## Project structure

```text
client/
  src/
    api/              Frontend API client
    components/       Input, generated content, and saved-set UI
    App.jsx           Main application
  .env.example        Frontend environment variable template
server/
  models/             MongoDB study-set model
  routes/             Generation and saved-set API routes
  services/           Groq integration and response validation
  .env.example        Backend environment variable template
```

## Requirements

- Node.js **20.19+** or **22.12+** (required by Vite 8; use a supported Node.js LTS release).
- A Groq API key for generating study materials.
- MongoDB only if you want to save and manage study sets.

## Run locally

Open two terminals from the project directory.

### 1. Configure and start the backend

```sh
cd server
npm ci
cp .env.example .env
```

Open `server/.env` and set `GROQ_API_KEY` to a key from [Groq Console](https://console.groq.com/keys). Do not commit this file or share the key. If you want saved study sets, set `MONGO_URI` to your MongoDB connection string as well.

Start the API:

```sh
npm run dev
```

The API listens on `http://localhost:5000` by default. If port 5000 is already in use, choose an available port and use the same port in the frontend's `VITE_API_URL`.

### 2. Start the frontend

In a second terminal:

```sh
cd client
npm ci
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The frontend uses `http://localhost:5000` by default. To use a different API address, set `VITE_API_URL` in `client/.env`, for example:

```env
VITE_API_URL=http://localhost:5001
```

Restart the Vite development server after changing environment variables.

## Configuration

| Variable | Used by | Required | Description |
| --- | --- | --- | --- |
| `GROQ_API_KEY` | Server | For generation | Secret API key used to request generated study material. |
| `GROQ_MODEL` | Server | No | Groq model name; defaults to `llama-3.1-8b-instant`. |
| `PORT` | Server | No | API port; defaults to `5000`. |
| `MONGO_URI` | Server | No | MongoDB connection string. Without it, generation still works, but saving and listing study sets are unavailable. |
| `CLIENT_ORIGIN` | Server | No | Comma-separated allowed frontend origins; defaults to `http://localhost:5173`. |
| `VITE_API_URL` | Client | No | Backend base URL; defaults to `http://localhost:5000`. |

Environment files (`.env`) are excluded from Git. Keep API keys and database credentials out of source code, commits, screenshots, and chat messages. If a key is exposed, revoke it and create a replacement.

## API

The backend base URL is `http://localhost:5000` unless `PORT` is changed.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | API health check. |
| `POST` | `/api/generate` | Generate study material from text. |
| `GET` | `/api/studysets` | List saved study sets (requires MongoDB). |
| `GET` | `/api/studysets/:id` | Retrieve one saved study set (requires MongoDB). |
| `DELETE` | `/api/studysets/:id` | Delete a saved study set (requires MongoDB). |

Example generation request:

```sh
curl -X POST http://localhost:5000/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"text":"Paste at least 50 characters of study material here to generate a set of learning aids."}'
```

The generation response contains `summary`, `keyPoints`, `mcqs`, and `flashcards`; `id` is `null` when the set was not saved. Generation requires a valid Groq API key. The API accepts 50–12,000 characters of study material.

## Build and checks

Build the frontend for production:

```sh
cd client
npm ci
npm run build
npm audit
```

The generated static site is written to `client/dist`.

## Deployment notes

- Deploy the backend and frontend separately. Configure `GROQ_API_KEY`, `MONGO_URI` (if persistence is needed), `PORT`, and `CLIENT_ORIGIN` in the backend hosting provider's secret/environment settings.
- Set the deployed frontend's `VITE_API_URL` to the backend's public base URL, with no trailing slash, then rebuild the frontend.
- Set `CLIENT_ORIGIN` to the exact deployed frontend origin. For multiple trusted origins, separate them with commas.
- Use your database provider's recommended network restrictions and credentials; avoid opening database access to all IP addresses unless you have a deliberate, secured reason.
- Never place server secrets in frontend environment variables. Variables prefixed with `VITE_` are included in the browser bundle and are public.
