export const formatDate = (value) => {
  if (!value) return 'Unknown date';
  return new Date(value).toLocaleDateString();
};

export const getErrorDetails = (error) => {
  const errObj = error?.response?.data?.error || {};
  const fieldValues = errObj?.fields && typeof errObj.fields === 'object'
    ? Object.values(errObj.fields).filter(Boolean)
    : [];
  return {
    message: errObj.message || error?.response?.data?.message || error?.message || 'Something went wrong',
    fields: fieldValues,
  };
};

export const getErrorMessage = (error) => {
  const details = getErrorDetails(error);
  if (details.fields.length) return `${details.message}: ${details.fields.join(', ')}`;
  return details.message;
};

export const truncate = (str, n = 100) => {
  return str?.length > n ? str.substr(0, n - 1) + '...' : str;
};

export const categoryColor = (category) => {
  const colors = {
    'Artificial Intelligence': '#3b82f6',
    'Machine Learning':        '#22c55e',
    'Computer Science':        '#6366f1',
    'Biology':                 '#10b981',
    'Chemistry':               '#06b6d4',
    'Physics':                 '#a855f7',
    'Mathematics':             '#ef4444',
    'Medicine':                '#f43f5e',
    'Environmental Science':   '#84cc16',
    'Social Science':          '#f97316',
    'Economics':               '#eab308',
    'Psychology':              '#ec4899',
    'Engineering':             '#0ea5e9',
  };
  return colors[category] || '#64748b';
};
