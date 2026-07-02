# URL Shortener — Full Stack App

A full-stack URL shortener: paste a long link, get a short one, and track click analytics.

- **Backend**: Node.js, Express, MongoDB (Mongoose), nanoid — `/backend`
- **Frontend**: React + Vite ("Shortline" ticket-counter UI) — `/frontend`

The two were originally built and zipped separately but already share the same API
contract, so this merge just wires them together into one runnable project (plus a
few small production niceties: CORS, a configurable port, and the backend optionally
serving the built frontend).

## Project structure

```
.
├── backend/     Express API + MongoDB models/routes
├── frontend/    React + Vite UI
└── package.json Root scripts to run/build both together
```

## 1. Prerequisites

- Node.js 18+
- A MongoDB database — either a local `mongod` instance or a free
  [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## 2. Install dependencies

From the project root:

```bash
npm run install:all
```

(This just runs `npm install` inside both `backend/` and `frontend/`. You can also
`cd` into each folder and `npm install` individually.)

## 3. Configure environment variables

**Backend** — copy the example env file and fill in your MongoDB URI:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
PORT=8001
```

**Frontend** — no `.env` needed for local dev. The Vite dev server proxies
`/api/*` requests straight to `http://localhost:8001` (see `frontend/vite.config.js`),
so the two apps talk to each other automatically. Only set `frontend/.env` if you're
deploying the frontend separately from the backend (see Deployment below).

## 4. Run in development

From the project root, this starts both servers together:

```bash
npm run dev
```

- Backend API: http://localhost:8001
- Frontend UI: http://localhost:5173 (open this in your browser)

Or run them separately in two terminals if you prefer:

```bash
npm run dev --prefix backend    # nodemon, http://localhost:8001
npm run dev --prefix frontend   # vite,    http://localhost:5173
```

## 5. Verify it's working

- Visit http://localhost:5173, paste a URL, and you should get a short link "ticket".
- `GET http://localhost:8001/health` should return `{"status":"ok","dbState":1}`
  (dbState `1` means MongoDB is connected — if it's `0` or `2`, double check `MONGO_URI`).
- `backend/test.js` has a small smoke test you can run against the API directly:
  ```bash
  npm run test:backend
  ```

## 6. Production build / single-server deploy

For a single deployable service, build the frontend and let the backend serve it
as static files alongside the API:

```bash
npm run build   # builds frontend/dist
npm start       # builds (again, harmlessly) and starts the backend on $PORT
```

The backend (`backend/index.js`) automatically serves `frontend/dist` if present,
so one process handles both the UI and the API — useful for platforms like Render,
Railway, or Fly.io where you'd rather run one service than two.

### Deploying frontend and backend separately instead

If you'd rather deploy the frontend (e.g. Vercel/Netlify) and backend (e.g. Render)
as two separate services:

1. Deploy `backend/` as its own service, with `MONGO_URI` set in its environment.
2. In `frontend/.env`, set `VITE_API_BASE_URL` to the deployed backend's full URL
   (see `frontend/.env.example`), then build/deploy `frontend/`.
3. Make sure the backend allows cross-origin requests — CORS is already enabled
   in `backend/index.js` via the `cors` package.

## API reference

| Method | Route                     | Description                              |
|--------|----------------------------|-------------------------------------------|
| POST   | `/url`                    | Body `{ "url": "https://..." }` → creates a short link |
| GET    | `/url/analytics/:shortId` | Returns total clicks + visit history      |
| GET    | `/:shortId`                | Redirects to the original URL, logs a visit |
| GET    | `/health`                  | `{ status, dbState }` — checks DB connection |
