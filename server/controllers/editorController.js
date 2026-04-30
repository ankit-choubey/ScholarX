const Paper  = require('../models/Paper');
const User   = require('../models/User');
const Review = require('../models/Review');
const { sendEmail } = require('../services/emailService');

exports.assignReviewer = async (req, res, next) => {
  try {
    const { paperId, reviewerIds } = req.body;
    if (!Array.isArray(reviewerIds) || reviewerIds.length < 1 || reviewerIds.length > 3) {
      return res.status(400).json({ success: false, error: { code: 'REVIEWER_COUNT_INVALID', message: 'Provide 1–3 reviewer IDs', fields: null } });
    }
    const reviewers = await User.find({ _id: { $in: reviewerIds }, role: 'reviewer' });
    if (reviewers.length !== reviewerIds.length) {
      return res.status(400).json({ success: false, error: { code: 'REVIEWER_NOT_FOUND', message: 'One or more IDs are not valid reviewers', fields: null } });
    }
    const paper = await Paper.findById(paperId).populate('authorId', 'name email');
    if (!paper) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Paper not found', fields: null } });

    // Merge new reviewers with existing (deduplicated)
    const existingIds = paper.assignedReviewers.map(String);
    const mergedIds   = [...new Set([...existingIds, ...reviewerIds.map(String)])];
    paper.assignedReviewers = mergedIds;
    paper.status = 'under_review';
    await paper.save();
    try { await sendEmail(paper.authorId.email, 'reviewerAssigned', paper.authorId.name, paper.title); } catch (_) {}
    res.json({ success: true, data: { paper, message: `${reviewerIds.length} reviewer(s) assigned (${mergedIds.length} total)` } });
  } catch (err) { next(err); }
};

exports.decisionOnPaper = async (req, res, next) => {
  try {
    const { decision, editorNote } = req.body;
    const note = String(editorNote || '').trim();
    const map = { accept: 'accepted', reject: 'rejected', revision_required: 'revision_required' };
    if (!map[decision]) return res.status(400).json({ success: false, error: { code: 'INVALID_DECISION', message: 'decision must be accept, reject, or revision_required', fields: null } });
    if (decision === 'revision_required' && !note) {
      return res.status(400).json({
        success: false,
        error: { code: 'EDITOR_NOTE_REQUIRED', message: 'Editor note is required for revision required', fields: { editorNote: 'Provide revision guidance for the author.' } },
      });
    }
    const paper = await Paper.findById(req.params.paperId).populate('authorId', 'name email');
    if (!paper) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Paper not found', fields: null } });
    if (paper.status !== 'under_review') return res.status(400).json({ success: false, error: { code: 'PAPER_NOT_UNDER_REVIEW', message: 'Paper must be under_review to make a decision', fields: null } });
    const reviewCount = await Review.countDocuments({ paperId: paper._id });
    if (reviewCount < 1) {
      return res.status(400).json({
        success: false,
        error: { code: 'REVIEWS_REQUIRED', message: 'At least one submitted review is required before final decision', fields: null },
      });
    }
    paper.status = map[decision];
    if (note) paper.editorNote = note;
    await paper.save();
    try { await sendEmail(paper.authorId.email, 'decisionMade', paper.authorId.name, paper.title, map[decision], editorNote); } catch (_) {}
    res.json({ success: true, data: { paper, message: 'Decision recorded. Author notified.' } });
  } catch (err) { next(err); }
};

exports.getSubmissionsOverview = async (req, res, next) => {
  try {
    const statuses = ['submitted','under_review','revision_required','accepted','rejected','published'];
    const counts = await Promise.all(statuses.map((s) => Paper.countDocuments({ status: s })));
    const stats = { total: 0 };
    statuses.forEach((s, i) => { stats[s] = counts[i]; stats.total += counts[i]; });
    const recentSubmissions = await Paper.find().populate('authorId','name').sort({ createdAt: -1 }).limit(5).lean();
    res.json({ success: true, data: { stats, recentSubmissions } });
  } catch (err) { next(err); }
};

exports.getAvailableReviewers = async (req, res, next) => {
  try {
    const reviewers = await require('../models/User').find({ role: 'reviewer' }).lean();
    const withLoad  = await Promise.all(reviewers.map(async (r) => ({
      ...r,
      activeReviews: await Paper.countDocuments({ assignedReviewers: r._id, status: 'under_review' }),
    })));
    res.json({ success: true, data: { reviewers: withLoad } });
  } catch (err) { next(err); }
};
