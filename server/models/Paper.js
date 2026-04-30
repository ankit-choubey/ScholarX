const mongoose = require('mongoose');

const STATUSES = ['submitted', 'under_review', 'revision_required', 'accepted', 'rejected', 'published'];

const revisionSchema = new mongoose.Schema({
  fileUrl:      { type: String, required: true },
  revisionNote: { type: String, required: true },
  uploadedAt:   { type: Date, default: Date.now },
});

const paperSchema = new mongoose.Schema(
  {
    title:    { type: String, required: true, trim: true, minlength: 10, maxlength: 300 },
    abstract: { type: String, required: true, minlength: 100, maxlength: 5000 },
    keywords: {
      type: [String], required: true,
      validate: { validator: (a) => a.length >= 1 && a.length <= 10, message: '1–10 keywords required' },
    },
    authorId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    coAuthors:         [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    fileUrl:           { type: String, required: true },
    status:            { type: String, enum: STATUSES, default: 'submitted' },
    assignedReviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    editorNote:        { type: String, default: '', maxlength: 2000 },
    revisionHistory:   [revisionSchema],
    plagiarismScore:   { type: Number, default: null, min: 0, max: 100 },
    submissionDate:    { type: Date, default: Date.now },
  },
  { timestamps: true }
);

paperSchema.pre('save', function (next) {
  if (this.isModified('keywords')) {
    this.keywords = [...new Set(this.keywords.map((k) => k.trim().toLowerCase()))];
  }
  next();
});

paperSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });
paperSchema.index({ authorId: 1, status: 1, createdAt: -1 });
paperSchema.index({ assignedReviewers: 1, status: 1 });
paperSchema.index({ status: 1 });

module.exports = mongoose.model('Paper', paperSchema);
