# BookLeaf Support Desk

A full stack author support portal and operations dashboard built with Node.js and browser-native JavaScript. It uses a small REST API, a local JSON store, signed-in sessions, role-based access, live ticket events, and optional server-side OpenAI integration. It has no npm dependencies.

## Run locally

Requirements: Node.js 20 or newer.

```sh
cp .env.example .env
# Set SESSION_SECRET to a long random value before using real accounts.
node server.js
```

Open [http://localhost:3000](http://localhost:3000). The first launch imports the company-provided authors and books from `company-authors.json` into `data/store.json`.

| Role | Email | Password |
| --- | --- | --- |
| Author (Priya Sharma) | `priya.sharma@email.com` | `Author123!` |
| Operations admin | `admin@bookleaf.demo` | `Admin123!` |

Other author emails in `company-authors.json` also use `Author123!` for local demo access. The source data does not provide passwords, so this shared password is only a development convenience. Replace it with individual credentials before any real deployment. When upgrading from the initial sample-data version, restart the server once to import the company records; the original generated sample store is replaced on that first restart. The local JSON store is intended for this assignment/demo, not multi-instance production hosting.

## AI design

Set `GEMINI_API_KEY` in the server-only `.env` file to enable Gemini. `GEMINI_MODEL` selects the model; the default is `gemini-3.5-flash-lite`, which Google optimizes for low-latency tasks. The server sends the key in the `x-goog-api-key` header and never sends it to browser code. Google documents this `generateContent` REST endpoint and header in the [Gemini API guide](https://ai.google.dev/gemini-api/docs/generate-content).

New tickets receive an immediate local category and priority estimate, so ticket creation does not depend on the AI provider. A background call may replace those estimates with validated model output; AI failure, timeout, or rate limiting leaves the ticket available with its fallback values. Admins can edit all three fields. The admin's “Draft with AI” action only sends the latest six conversation messages, ticket metadata, and at most 6,000 characters of the knowledge base. The response is a draft only; a human must review and send it. Prompts treat ticket text as untrusted input and instruct the model not to invent missing policies or account-specific facts.

The assignment mentions an included BookLeaf Knowledge Base, but its contents were not present in the supplied requirements. Add approved material to [knowledge-base.md](knowledge-base.md) before relying on AI-drafted policy guidance. In its current state, AI drafts should ask the author for missing details or say the team will verify them.

## Product behavior

- Authors see only their own books and tickets. Support queries support a book selection or “General / Account Level.” File selection is a UI preview only; attachments are not uploaded or stored.
- Admins can filter tickets by status, category, priority, and date, override the AI estimates, assign a ticket to themselves, change status, add internal notes, and send author-visible replies.
- Ticket changes arrive over Server-Sent Events without refreshing the page. The stream filters events by author, and internal notes are included only for admin sessions.
- Passwords use Node's scrypt password hashing. Session identifiers are random, held server-side, and sent in HttpOnly, SameSite=Lax cookies. `Secure` is added when `NODE_ENV=production`.
- Keep the app behind HTTPS in production, set a strong `SESSION_SECRET`, and replace the local JSON store with a transactional database before multi-process deployment.

## REST API

All API responses are JSON except `GET /api/events` (Server-Sent Events). Login sets the HttpOnly session cookie. Protected endpoints return `401` when signed out; authors receive `404` when requesting a ticket they do not own. Invalid input receives a specific `400` message; unknown routes receive `404`.

### Authentication

| Method and path | Access | Request / response |
| --- | --- | --- |
| `GET /api/health` | Public | `{ "ok": true, "service": "bookleaf-support-desk" }` |
| `POST /api/auth/login` | Public | Body `{ "email", "password" }`; response `{ "user" }` and session cookie. Invalid credentials return `401`. |
| `POST /api/auth/logout` | Public | Clears the current session cookie. |
| `GET /api/auth/me` | Signed in | Returns the current public user profile. |

### Books and tickets

| Method and path | Access | Request / response |
| --- | --- | --- |
| `GET /api/books` | Signed in | `{ "books": [...] }`; author results are scoped to the signed-in author. |
| `GET /api/tickets` | Signed in | `{ "tickets": [...] }`; optional filters: `status`, `category`, `priority`, `from` and `to` (`YYYY-MM-DD`). Results sort by priority and age. |
| `POST /api/tickets` | Author | Body `{ "bookId": "general" or owned book ID, "subject", "description" }`; returns `201` and the created ticket. Subject: 3–160 chars; description: 10–5,000 chars. AI classification runs in the background. |
| `GET /api/tickets/:id` | Owner or admin | Returns `{ "ticket" }`. Internal notes appear only for admins. |
| `PATCH /api/tickets/:id` | Admin | Optional fields: `status`, `category`, `priority`, `assignedTo` (admin ID or `null`). Returns updated `{ "ticket" }`. |
| `POST /api/tickets/:id/reply` | Owner or admin | Body `{ "body" }`; adds an author-visible conversation message and returns the updated ticket. |
| `POST /api/tickets/:id/notes` | Admin | Body `{ "body" }`; creates a private internal note. |
| `POST /api/tickets/:id/draft` | Admin | Requests an AI response draft; returns `{ "draft", "ai" }`. On missing key/provider failure returns an empty draft and a manual-response message, without failing the ticket workflow. |
| `GET /api/events` | Signed in | SSE stream with `ticket` events on creation, classification, status, notes, and replies. Events are scoped by role and author. |
| `GET /api/admin/users` | Admin | Returns user profiles for queue attribution. |

Ticket statuses: `Open`, `In Progress`, `Resolved`, `Closed`. Categories: `Royalty & Payments`, `ISBN & Metadata Issues`, `Printing & Quality`, `Distribution & Availability`, `Book Status & Production Updates`, `General Inquiry`. Priorities: `Critical`, `High`, `Medium`, `Low`.

## Project files

- `company-authors.json` — company-provided author and book records. This is outside `public/` and is not served to browsers.
- `server.js` — HTTP server, REST routes, validation, sessions, JSON persistence, SSE and AI provider calls.
- `public/` — responsive author/admin app.
- `knowledge-base.md` — server-only context supplied to the draft prompt.
- `.env.example` — optional server configuration template. Copy it to `.env` and add the newly generated Gemini key there.
