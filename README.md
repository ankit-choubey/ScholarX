# 🎓 ScholarX — Research Publication Management System

> A full-stack MERN application for managing academic paper submissions, peer reviews, editorial decisions, and publications.

---

## 👥 Team

| Role | Person | Stack |
|---|---|---|
| Frontend | Nihar | React + Vite + TailwindCSS |
| Backend | Ankit | Node.js + Express + JWT |
| Database | Vaibhav | MongoDB + Mongoose |
| DevOps / Advanced | Srujan | Search, Plagiarism, Deployment |

---

## 🚀 Quick Start

### 1. Clone & install all dependencies

```bash
npm run install:all
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
cp frontend/.env.example frontend/.env
```
Edit `server/.env` and fill in your `MONGO_URI`, `JWT_SECRET`, Cloudinary, and email credentials.

### 3. Seed the database (development only)

```bash
npm run seed
```

This creates 3 test accounts, 2 papers, 1 review, and 1 publication.

**Test credentials:**
| Role | Email | Password |
|---|---|---|
| Editor | editor@scholarx.dev | DevPassword@123 |
| Researcher | researcher@scholarx.dev | DevPassword@123 |
| Reviewer | reviewer@scholarx.dev | DevPassword@123 |

### 4. Run the full app (both server + client)

```bash
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5005/api  
- **Health check:** http://localhost:5005/health

---

## 📁 Project Structure

```
scholarx/
├── frontend/                ← React Frontend (Vite + TailwindCSS)
│   ├── src/
│   │   ├── components/      ← Reusable UI components
│   │   ├── context/         ← AuthContext (global auth state)
│   │   ├── pages/           ← All route-level pages
│   │   ├── services/        ← Axios API call wrappers
│   │   ├── utils/           ← Helpers, constants, validators
│   │   └── styles/          ← Global CSS + Tailwind
│   └── package.json
│
├── server/                  ← Express Backend
│   ├── config/              ← DB, Cloudinary, Email setup
│   ├── controllers/         ← Business logic handlers
│   ├── middleware/          ← Auth, role guard, upload, error
│   ├── models/              ← Mongoose schemas (User, Paper, Review, Publication)
│   ├── routes/              ← API route definitions
│   ├── services/            ← Email, plagiarism, citation services
│   ├── utils/               ← JWT token generator
│   ├── seed.js              ← Database seeder (dev only)
│   └── server.js            ← Express entry point
│
├── planning/                ← Architecture docs & API contracts
│   ├── MASTER_CODE.md
│   └── CONTEXT_LOG.md
│
├── package.json             ← Root scripts (runs both together)
├── .gitignore
└── README.md
```

---

## 🔐 Role-Based Access

| Feature | Researcher | Reviewer | Editor |
|---|---|---|---|
| Submit paper | ✅ | ❌ | ❌ |
| View own papers | ✅ | ❌ | ✅ |
| Submit review | ❌ | ✅ | ❌ |
| Assign reviewer | ❌ | ❌ | ✅ |
| Approve / Reject | ❌ | ❌ | ✅ |
| View publications | ✅ | ✅ | ✅ |
| Analytics | ✅ | ✅ | ✅ |

---

## 🌐 API Endpoints (summary)

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, receive JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/profile` | ✅ | Update profile |
| POST | `/api/papers` | researcher | Submit paper (PDF) |
| GET | `/api/papers/my` | researcher | My papers |
| GET | `/api/papers` | editor | All papers |
| GET | `/api/papers/:id` | ✅ | Paper detail |
| PUT | `/api/papers/:id` | researcher | Revise paper |
| DELETE | `/api/papers/:id` | researcher | Delete (submitted only) |
| GET | `/api/reviews/assigned` | reviewer | Assigned papers |
| POST | `/api/reviews` | reviewer | Submit review |
| GET | `/api/reviews/paper/:id` | editor | Reviews for paper |
| POST | `/api/editor/assign` | editor | Assign reviewers |
| PUT | `/api/editor/decision/:id` | editor | Accept/Reject |
| GET | `/api/editor/overview` | editor | Dashboard stats |
| GET | `/api/publications` | — | All publications |
| POST | `/api/publications` | editor | Publish paper |
| GET | `/api/search?q=...` | — | Full-text search |
| GET | `/api/analytics` | ✅ | Platform analytics |
| POST | `/api/advanced/plagiarism` | ✅ | Plagiarism check |
| POST | `/api/advanced/citation` | ✅ | Citation formatter |

---

## 🚀 Deployment

| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| File Storage | Cloudinary |

**Deploy order:** Atlas → Render → Vercel

---

## ⚠️ Important Notes

- Never commit `.env` — it's in `.gitignore`
- File uploads are PDF only, max 10MB
- Rate limit: 100 requests / 15 min per IP
- JWT stored in `localStorage` (consistent with frontend interceptors)
- Seed script **refuses** to run in `NODE_ENV=production`
