import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PublicationForm from '../components/publications/PublicationForm';
import { getPublicationById, updatePublication } from '../services/publicationService';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';
import { getErrorMessage } from '../utils/helpers';
import './FormPages.css';

const EditPublication = () => {
  const { id }                = useParams();
  const navigate              = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    getPublicationById(id)
      .then((res) => setInitial(res.data?.data?.publication || res.data))
      .catch(() => { toast.error('Publication not found.'); navigate('/dashboard'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      await updatePublication(id, data);
      toast.success('Publication updated successfully!');
      navigate(`/publications/${id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading publication…" />;

  return (
    <div className="page-wrapper form-page fade-up">
      <Link to={`/publications/${id}`} className="back-link"><FiArrowLeft /> Back to Publication</Link>

      <div className="form-page-header">
        <h1 className="section-title">Edit Publication</h1>
        <p className="section-subtitle">Update publication metadata and indexing details</p>
        <div className="divider" />
      </div>

      <div className="form-card">
        <PublicationForm onSubmit={handleSubmit} initialData={initial} isLoading={saving} />
      </div>
    </div>
  );
};

export default EditPublication;
