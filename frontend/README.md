# 📚 ResearchScholar — Frontend Setup Guide

Complete step-by-step instructions to run the React frontend on your laptop.

---

## ✅ Prerequisites — Install These First

Before you begin, make sure these are installed on your laptop:

### 1. Node.js & npm
- Download from: https://nodejs.org (choose LTS version)
- After installing, verify:
  ```
  node --version    ← should show v18.x or higher
  npm --version     ← should show 9.x or higher
  ```

### 2. Git (optional but recommended)
- Download from: https://git-scm.com

### 3. VS Code (recommended editor)
- Download from: https://code.visualstudio.com

---

## 📁 STEP 1 — Create Your Project Folder

Open your terminal (Command Prompt / PowerShell on Windows, Terminal on Mac/Linux):

```bash
# Go to where you want your project (e.g., Desktop)
cd Desktop

# Create a main project folder
mkdir research-scholar
cd research-scholar
```

Your full project will look like this when complete:
```
research-scholar/
├── frontend/     ← React app (this folder)
└── backend/      ← Node.js + Express (coming later)
```

---

## 📦 STEP 2 — Set Up the React Frontend

```bash
# Make sure you're inside the research-scholar folder
# Create a new React app named "frontend"
npx create-react-app frontend

# Go into the frontend folder
cd frontend
```

---

## 📋 STEP 3 — Install All Dependencies

```bash
npm install axios react-router-dom react-hook-form react-icons react-toastify react-paginate jwt-decode
```

Wait for installation to complete (takes 1–2 minutes).

---

## 📂 STEP 4 — Copy All Source Files

Replace the contents of the `src/` folder with the provided files.

The final `src/` structure should be:
```
src/
├── index.js
├── index.css
├── App.jsx
├── context/
│   └── AuthContext.jsx
├── services/
│   ├── api.js
│   ├── authService.js
│   └── publicationService.js
├── utils/
│   ├── constants.js
│   └── helpers.js
├── components/
│   ├── common/
│   │   ├── Navbar.jsx + Navbar.css
│   │   ├── Footer.jsx + Footer.css
│   │   ├── Loader.jsx
│   │   ├── SearchBar.jsx + SearchBar.css
│   │   └── ProtectedRoute.jsx
│   └── publications/
│       ├── PublicationCard.jsx + PublicationCard.css
│       └── PublicationForm.jsx + PublicationForm.css
└── pages/
    ├── Home.jsx + Home.css
    ├── Login.jsx
    ├── Register.jsx
    ├── AuthPages.css      ← shared by Login & Register
    ├── Dashboard.jsx + Dashboard.css
    ├── PublicationsPage.jsx + PublicationsPage.css
    ├── PublicationDetailPage.jsx + PublicationDetailPage.css
    ├── AddPublication.jsx
    ├── EditPublication.jsx
    ├── FormPages.css      ← shared by Add & Edit
    └── NotFound.jsx + NotFound.css
```

Also replace `public/index.html` with the provided one.

---

## ⚙️ STEP 5 — Create the .env File

Inside the `frontend/` folder, create a file named `.env`:

```
REACT_APP_API_URL=http://localhost:5005/api
```

> ⚠️ This tells the frontend where your backend lives.
> When your backend is running on port 5005, this is correct.

---

## 🚀 STEP 6 — Start the Frontend

```bash
# Make sure you're in the frontend/ folder
npm start
```

Your browser will automatically open to:
```
http://localhost:3000
```

You'll see the ResearchScholar homepage! 🎉

---

## 🔌 Connecting to Backend

The frontend expects the backend to be running at `http://localhost:5005`.

| Frontend | Backend |
|----------|---------|
| localhost:3000 | localhost:5005 |
| React | Node.js + Express |

When running the full MERN app, open **two terminals**:
- Terminal 1 → `cd frontend && npm start`
- Terminal 2 → `cd backend && npm run dev`

---

## 📄 All Pages & Routes

| Route | Page | Access |
|-------|------|--------|
| `/` | Home | Public |
| `/publications` | Browse all papers | Public |
| `/publications/:id` | Paper detail | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/dashboard` | My papers + stats | 🔒 Login required |
| `/publications/add` | Submit new paper | 🔒 Login required |
| `/publications/edit/:id` | Edit paper | 🔒 Login required |

---

## 🔧 Troubleshooting

### "npm start" fails
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
npm start
```

### Port 3000 already in use
```bash
# Use a different port
PORT=3001 npm start         # Mac/Linux
set PORT=3001 && npm start  # Windows
```

### "Module not found" errors
Make sure all files are in the correct folders as shown in Step 4.

### CORS errors in browser console
This means your backend isn't running or CORS isn't set up.
Make sure your backend has:
```js
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000' }));
```

### API calls failing (network errors)
Check that:
1. Backend is running on port 5005
2. `.env` file has `REACT_APP_API_URL=http://localhost:5005/api`
3. Restart `npm start` after editing `.env`

---

## 🌐 API Endpoints the Frontend Calls

```
POST   /api/auth/register         ← Register user
POST   /api/auth/login            ← Login user
GET    /api/auth/profile          ← Get logged-in user

GET    /api/publications          ← All publications (with pagination)
GET    /api/publications/my       ← Logged-in user's publications
GET    /api/publications/search   ← Search publications
GET    /api/publications/:id      ← Single publication
POST   /api/publications          ← Create (auth required)
PUT    /api/publications/:id      ← Update (auth required, owner only)
DELETE /api/publications/:id      ← Delete (auth required, owner only)
```

---

## ✨ Features Included

- 🏠 Beautiful dark-academic home page with hero section
- 📚 Browse + search + filter + paginate publications
- 📄 Full publication detail page
- ➕ Add / ✏️ Edit / 🗑️ Delete publications (auth only)
- 👤 Dashboard with stats and my publications list
- 🔐 Login + Register with form validation
- 🔒 Protected routes (JWT auth)
- 📱 Fully responsive (mobile-friendly)
- 🎨 Dark theme with gold accents
- 🔔 Toast notifications

---

## 📝 Tech Stack Used

| Tech | Purpose |
|------|---------|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP API calls |
| React Hook Form | Form handling + validation |
| React Icons | Icon library |
| React Toastify | Notification toasts |
| React Paginate | Pagination UI |
| JWT Decode | Read auth tokens |
| CSS Variables | Design system theming |

---

*Built as part of a MERN Stack Research Publications project.*
*Backend: Node.js + Express + MongoDB*
