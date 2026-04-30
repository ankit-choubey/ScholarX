const Review = require('../models/Review');
const Paper  = require('../models/Paper');

exports.getAssignedPapers = async (req, res, next) => {
  try {
    const papers = await Paper.find({ assignedReviewers: req.user._id, status: 'under_review' })
      .populate('authorId', 'name').lean();
    const reviewed = await Review.find({ reviewerId: req.user._id }).distinct('paperId');
    const reviewedSet = new Set(reviewed.map(String));
    const items = papers.map((p) => ({ ...p, hasReviewed: reviewedSet.has(String(p._id)) }));
    res.json({ success: true, data: { items } });
  } catch (err) { next(err); }
};

exports.submitReview = async (req, res, next) => {
  try {
    const { paperId, comments, score, decision, isConfidential } = req.body;
    const paper = await Paper.findById(paperId);
    if (!paper) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Paper not found', fields: null } });
    if (paper.status !== 'under_review') return res.status(400).json({ success: false, error: { code: 'PAPER_NOT_UNDER_REVIEW', message: 'Paper is not under review', fields: null } });
    if (!paper.assignedReviewers.some((r) => String(r) === String(req.user._id))) {
      return res.status(403).json({ success: false, error: { code: 'NOT_ASSIGNED', message: 'Not assigned to this paper', fields: null } });
    }
    const review = await Review.create({ paperId, reviewerId: req.user._id, comments, score, decision, isConfidential });
    res.status(201).json({ success: true, data: { review } });
  } catch (err) { next(err); }
};

exports.getReviewsByPaper = async (req, res, next) => {
  try {
    const reviews = await Review.find({ paperId: req.params.paperId })
      .populate('reviewerId', 'name email').lean();
    res.json({ success: true, data: { reviews } });
  } catch (err) { next(err); }
};

exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Review not found', fields: null } });
    if (String(review.reviewerId) !== String(req.user._id)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not your review', fields: null } });
    const hoursSince = (Date.now() - new Date(review.reviewDate).getTime()) / 3_600_000;
    if (hoursSince > 24) return res.status(400).json({ success: false, error: { code: 'REVIEW_LOCKED', message: 'Reviews can only be edited within 24 hours', fields: null } });
    const allowed = ['comments', 'score', 'decision', 'isConfidential'];
    allowed.forEach((f) => { if (req.body[f] !== undefined) review[f] = req.body[f]; });
    await review.save();
    res.json({ success: true, data: { review } });
  } catch (err) { next(err); }
};
