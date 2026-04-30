import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PublicationForm from '../components/publications/PublicationForm';
import { createPublication } from '../services/publicationService';
import { getAllPapers } from '../services/paperService';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import { getErrorMessage } from '../utils/helpers';
import './FormPages.css';

const AddPublication = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [papers, setPapers] = useState([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    getAllPapers({ status: 'accepted', page: 1, limit: 100 })
      .then((res) => setPapers(res.data?.data?.items || []))
      .catch(() => toast.error('Failed to load accepted papers.'))
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await createPublication(data);
      toast.success('Paper published successfully.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader text="Loading accepted papers…" />;

  return (
    <div className="page-wrapper form-page fade-up">
      <Link to="/dashboard" className="back-link"><FiArrowLeft /> Back to Dashboard</Link>

      <div className="form-page-header">
        <h1 className="section-title">Publish Accepted Paper</h1>
        <p className="section-subtitle">Convert an accepted manuscript into a final publication record</p>
        <div className="divider" />
      </div>

      <div className="form-card">
        {papers.length ? (
          <PublicationForm
            onSubmit={handleSubmit}
            isLoading={loading}
            includePaperSelect
            paperOptions={papers}
          />
        ) : (
          <p className="text-slate-400">No accepted papers available to publish.</p>
        )}
      </div>
    </div>
  );
};

export default AddPublication;
