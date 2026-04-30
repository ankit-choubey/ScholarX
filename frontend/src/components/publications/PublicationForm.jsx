import React from 'react';
import { useForm } from 'react-hook-form';
import './PublicationForm.css';

const DOI_RE = /^10\.\d{4,9}\/[-._;()/:a-zA-Z0-9]+$/;

const PublicationForm = ({ onSubmit, initialData = {}, isLoading, includePaperSelect = false, paperOptions = [] }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      paperId: initialData.paperId?._id || initialData.paperId || '',
      journalName: initialData.journalName || '',
      doi: initialData.doi || '',
      volume: initialData.volume || '',
      issue: initialData.issue || '',
      publicationDate: initialData.publicationDate
        ? new Date(initialData.publicationDate).toISOString().split('T')[0]
        : '',
      citationCount: Number.isFinite(initialData.citationCount) ? initialData.citationCount : 0,
    },
  });

  return (
    <form className="pub-form" onSubmit={handleSubmit(onSubmit)}>
      {includePaperSelect && (
        <div className="form-group">
          <label>Accepted Paper *</label>
          <select {...register('paperId', { required: 'Accepted paper selection is required' })}>
            <option value="">— Select Accepted Paper —</option>
            {paperOptions.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title} {p.authorId?.name ? `— ${p.authorId.name}` : ''}
              </option>
            ))}
          </select>
          {errors.paperId && <p className="form-error">{errors.paperId.message}</p>}
        </div>
      )}

      <div className="form-group">
        <label>Journal Name *</label>
        <input
          {...register('journalName', { required: 'Journal name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
          placeholder="e.g. Nature, IEEE Transactions on..."
        />
        {errors.journalName && <p className="form-error">{errors.journalName.message}</p>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>DOI</label>
          <input
            {...register('doi', {
              validate: (v) => !v || DOI_RE.test(v) || 'Invalid DOI format',
            })}
            placeholder="10.xxxx/xxxx (optional)"
          />
          {errors.doi && <p className="form-error">{errors.doi.message}</p>}
        </div>
        <div className="form-group">
          <label>Publication Date</label>
          <input type="date" {...register('publicationDate')} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Volume</label>
          <input {...register('volume')} placeholder="e.g. 12" />
        </div>
        <div className="form-group">
          <label>Issue</label>
          <input {...register('issue')} placeholder="e.g. 3" />
        </div>
      </div>

      <div className="form-group">
        <label>Citation Count</label>
        <input type="number" min="0" {...register('citationCount', { min: 0 })} />
      </div>

      <button type="submit" className="btn btn-primary submit-btn" disabled={isLoading}>
        {isLoading ? 'Saving…' : (includePaperSelect ? 'Publish Paper' : 'Update Publication')}
      </button>
    </form>
  );
};

export default PublicationForm;
