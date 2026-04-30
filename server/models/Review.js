const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    paperId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Paper', required: true },
    reviewerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comments:       { type: String, required: true, minlength: 50, maxlength: 10000 },
    score:          { type: Number, required: true, min: 1, max: 10 },
    decision:       { type: String, enum: ['accept', 'minor_revision', 'major_revision', 'reject'], required: true },
    isConfidential: { type: Boolean, default: false },
    reviewDate:     { type: Date, default: Date.now },
  },
  { timestamps: true }
);

reviewSchema.index({ paperId: 1, reviewerId: 1 }, { unique: true });
reviewSchema.index({ paperId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
