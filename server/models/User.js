const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ORCID_RE = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;

const userSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:    { type: String, required: true, minlength: 8, select: false },
    role:        { type: String, enum: ['researcher', 'reviewer', 'editor'], required: true },
    bio:         { type: String, default: '', maxlength: 500 },
    institution: { type: String, default: '', maxlength: 200 },
    orcidId:     {
      type: String, default: '',
      validate: { validator: (v) => v === '' || ORCID_RE.test(v), message: 'Invalid ORCID format' },
    },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return require('bcryptjs').compare(entered, this.password);
};

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
