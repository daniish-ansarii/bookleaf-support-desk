<div align="center">

# 📝 BookLeaf Support Desk — Approach

**A complete support workflow for authors and operations staff, with optional AI doing the heavy lifting.**

![Runtime](https://img.shields.io/badge/Runtime-Node.js-339933?logo=node.js&logoColor=white)
![Database](https://img.shields.io/badge/Database-Neon%20Postgres-00E599?logo=postgresql&logoColor=white)
![AI](https://img.shields.io/badge/AI-Gemini%20Flash%20Lite-4285F4?logo=google&logoColor=white)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

[Priorities](#-priorities) · [Architecture](#%EF%B8%8F-architecture) · [AI Design](#-ai-design) · [Trade-offs](#%EF%B8%8F-trade-offs) · [Next Steps](#-given-more-time) · [Data Handling](#-data-handling)

</div>

---

## 🎯 Priorities

I prioritized a **complete support workflow for both sides**:

| 👤 Role | What they can do |
|---|---|
| ✍️ **Authors** | Sign in, view their books, submit queries, and follow replies. |
| 🛠️ **Operations staff** | Triage the shared queue, update status and priority, assign work, leave private notes, and respond. |

> 🔒 Authentication and role checks are enforced **in the API**, so an author cannot retrieve another author's books or tickets.

---

## 🏗️ Architecture

The service uses a **small Node.js REST API** and a **browser-native frontend** to keep setup simple.

- 💻 **Local development:** a JSON file.
- ☁️ **Hosted app:** Neon Postgres, so state survives Vercel's stateless functions.
- 🗄️ **Storage model:** for this assignment, the database stores application state as **one JSONB document**. This reduces setup and migration work, but it limits concurrent writes and reporting. I would replace it with normalized tables and migrations before scaling.

---

## 🤖 AI Design

AI is **optional** and runs **server-side** with **Gemini Flash Lite**, selected for a lightweight classification and drafting workload.

1. ⚡ **Local first:** new tickets first receive local category and priority estimates, so AI outages do not block ticket submission.
2. ✅ **Constrained output:** model output is limited to allowed values and treated as a suggestion that admins can override.
3. 💬 **Bounded context:** draft prompts use the ticket's recent messages and a bounded Knowledge Base excerpt.
4. 🛡️ **Safe prompting:** ticket text is treated as untrusted input, and the model is instructed to ask for missing facts instead of inventing policy.
5. 👀 **Human in the loop:** drafts require human review before sending.

> 📘 **Knowledge Base gap:** the provided requirements referenced a BookLeaf Knowledge Base but did not include its policy content. The app documents this gap and currently avoids unsupported policy claims.

---

## ⚖️ Trade-offs

To keep deployment straightforward on Vercel:

- ⏱️ **Updates use five-second polling** rather than persistent sockets.
- 📎 **Attachments are represented in the UI but are not uploaded.**
- 🔑 **Demo users share sample passwords** because credentials were absent from the supplied dataset. This is for evaluation only.

---

## 🚀 Given More Time

| Area | Planned improvement |
|---|---|
| 🔐 **Accounts** | Per-user invitations and password recovery |
| 🛡️ **Safety** | Rate limiting and audit logs |
| 🗄️ **Data** | Normalized schema with migrations and indexes |
| 📁 **Files** | Secure object storage with file scanning |
| 📡 **Realtime** | Push updates |
| 📈 **Operations** | Monitoring |
| 📘 **Knowledge** | An approved knowledge base |
| 🧪 **Quality** | An evaluation set for classification quality, response accuracy, latency, and fallback behavior |

---

## 📦 Data Handling

The repository and live demo should only expose company-provided author data **with explicit company approval**. Otherwise, I would publish **sanitized fixtures** and use **approved evaluation accounts**.

---

<div align="center">

Made with ☕ for authors and support teams

</div>