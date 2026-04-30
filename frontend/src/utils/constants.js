export const CATEGORIES = [
  'Artificial Intelligence',
  'Machine Learning',
  'Computer Science',
  'Biology',
  'Chemistry',
  'Physics',
  'Mathematics',
  'Medicine',
  'Environmental Science',
  'Social Science',
  'Economics',
  'Psychology',
  'Engineering',
  'Other',
];

export const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'oldest',     label: 'Oldest First' },
  { value: 'title_asc',  label: 'Title A–Z' },
  { value: 'title_desc', label: 'Title Z–A' },
];

export const STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  revision_required: 'Revision Required',
  accepted: 'Accepted',
  rejected: 'Rejected',
  published: 'Published',
};

export const REVIEW_DECISIONS = [
  { value: 'accept', label: 'Accept' },
  { value: 'minor_revision', label: 'Minor Revision' },
  { value: 'major_revision', label: 'Major Revision' },
  { value: 'reject', label: 'Reject' },
];
