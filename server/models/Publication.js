const mongoose = require('mongoose');

const DOI_RE = /^10\.\d{4,9}\/[-._;()/:a-zA-Z0-9]+$/;

const publicationSchema = new mongoose.Schema(
  {
    paperId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Paper', required: true, unique: true },
    journalName:     { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    doi:             {
      type: String, unique: true, sparse: true,
      validate: { validator: (v) => !v || DOI_RE.test(v), message: 'Invalid DOI format' },
    },
    volume:          { type: String, default: '', maxlength: 20 },
    issue:           { type: String, default: '', maxlength: 20 },
    publicationDate: { type: Date, default: Date.now },
    citationCount:   { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

publicationSchema.index({ publicationDate: -1 });

module.exports = mongoose.model('Publication', publicationSchema);
