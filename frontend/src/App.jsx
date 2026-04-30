import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider }     from './context/AuthContext';
import ProtectedRoute       from './components/common/ProtectedRoute';
import Navbar               from './components/common/Navbar';
import Footer               from './components/common/Footer';

import Home                  from './pages/Home';
import Login                 from './pages/Login';
import Register              from './pages/Register';
import Dashboard             from './pages/Dashboard';
import PublicationsPage      from './pages/PublicationsPage';
import PublicationDetailPage from './pages/PublicationDetailPage';
import AddPublication        from './pages/AddPublication';
import EditPublication       from './pages/EditPublication';
import NotFound              from './pages/NotFound';
import About                 from './pages/About';
import Contact               from './pages/Contact';
import Authors               from './pages/Authors';
import AnalyticsPage         from './pages/AnalyticsPage';
import MyPapersPage          from './pages/MyPapersPage';
import PaperDetailPage       from './pages/PaperDetailPage';
import ReviewPage            from './pages/ReviewPage';
import SearchPage            from './pages/SearchPage';
import SubmitPaperPage       from './pages/SubmitPaperPage';
import { Toaster }           from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            {/* Public */}
            <Route path="/"              element={<Home />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/register"      element={<Register />} />
            <Route path="/publications"  element={<PublicationsPage />} />
            <Route path="/publications/:id" element={<PublicationDetailPage />} />
            <Route path="/about"         element={<About />} />
            <Route path="/contact"       element={<Contact />} />
            <Route path="/authors"       element={<Authors />} />
            <Route path="/search"        element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />

            {/* Any logged-in user */}
            <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/papers/:id"    element={<ProtectedRoute><PaperDetailPage /></ProtectedRoute>} />

            {/* Researcher only */}
            <Route path="/submit"        element={<ProtectedRoute roles={['researcher']}><SubmitPaperPage /></ProtectedRoute>} />
            <Route path="/my-papers"     element={<ProtectedRoute roles={['researcher']}><MyPapersPage /></ProtectedRoute>} />

            {/* Reviewer only */}
            <Route path="/review/:id"    element={<ProtectedRoute roles={['reviewer']}><ReviewPage /></ProtectedRoute>} />

            {/* Editor only */}
            <Route path="/analytics"        element={<ProtectedRoute roles={['editor']}><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/publications/add" element={<ProtectedRoute roles={['editor']}><AddPublication /></ProtectedRoute>} />
            <Route path="/publications/edit/:id" element={<ProtectedRoute roles={['editor']}><EditPublication /></ProtectedRoute>} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1a1a2e', color: '#f8fafc', border: '1px solid rgba(99,102,241,0.3)' },
          }}
        />
        <ToastContainer
          position="top-right"
          autoClose={3500}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
