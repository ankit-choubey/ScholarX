const Paper = require('../models/Paper');
const User  = require('../models/User');
const Review = require('../models/Review');
const Publication = require('../models/Publication');

exports.submitPaper = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: { code: 'FILE_MISSING', message: 'PDF file is required', fields: null } });
    const { title, abstract, keywords, coAuthors } = req.body;
    const keywordsArr  = (keywords || '').split(',').map((k) => k.trim()).filter(Boolean);
    let   coAuthorsArr = [];
    if (coAuthors) {
      let parsedEmails = [];
      try {
        parsedEmails = JSON.parse(coAuthors);
      } catch (e) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_COAUTHORS', message: 'Invalid co-authors format', fields: null } });
      }

      if (!Array.isArray(parsedEmails)) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_COAUTHORS', message: 'Invalid co-authors format', fields: null } });
      }

      const normalizedEmails = [...new Set(
        parsedEmails
          .map((email) => String(email || '').trim().toLowerCase())
          .filter(Boolean)
          .filter((email) => email !== String(req.user.email || '').toLowerCase())
      )];

      const users = await User.find({ email: { $in: normalizedEmails } }).select('_id email');
      const foundEmails = new Set(users.map((u) => String(u.email || '').toLowerCase()));
      const missingEmails = normalizedEmails.filter((email) => !foundEmails.has(email));
      if (missingEmails.length) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'COAUTHOR_NOT_FOUND',
            message: `These co-author emails are not registered: ${missingEmails.join(', ')}`,
            fields: { coAuthors: 'All co-authors must be existing registered users.' },
          },
        });
      }
      coAuthorsArr = users.map((u) => u._id);
    }
    const uploadedFileUrl = req.file.path || req.file.secure_url || req.file.url;
    const paper = await Paper.create({ title, abstract, keywords: keywordsArr, coAuthors: coAuthorsArr, authorId: req.user._id, fileUrl: uploadedFileUrl });
    res.status(201).json({ success: true, data: { paper } });
  } catch (err) { next(err); }
};

exports.getMyPapers = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { $or: [{ authorId: req.user._id }, { coAuthors: req.user._id }] };
    if (status) query.status = status;
    const [papers, total] = await Promise.all([
      Paper.find(query)
        .populate('authorId', 'name email')
        .populate('coAuthors', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Paper.countDocuments(query),
    ]);
    res.json({ success: true, data: { items: papers, total, page: Number(page), totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.getPaperById = async (req, res, next) => {
  try {
    const paper = await Paper.findById(req.params.id)
      .populate('authorId', 'name email institution')
      .populate('coAuthors', 'name email')
      .populate('assignedReviewers', 'name email');
    if (!paper) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Paper not found', fields: null } });

    const uid  = String(req.user._id);
    const role = req.user.role;
    const isAuthor   = String(paper.authorId._id) === uid;
    const isCoAuthor = paper.coAuthors.some((c) => String(c._id) === uid);
    const isAssigned = paper.assignedReviewers.some((r) => String(r._id) === uid);
    const isEditor   = role === 'editor';
    if (!isAuthor && !isCoAuthor && !isAssigned && !isEditor) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to view this paper', fields: null } });
    }

    const reviewQuery = { paperId: paper._id };
    if (role === 'researcher') {
      if (!['accepted','rejected','revision_required'].includes(paper.status)) {
        return res.json({ success: true, data: { paper: { ...paper.toObject(), reviews: [] } } });
      }
    }
    if (role === 'reviewer') reviewQuery.reviewerId = req.user._id;
    const reviews = await Review.find(reviewQuery).populate('reviewerId', 'name').lean();

    res.json({ success: true, data: { paper: { ...paper.toObject(), reviews } } });
  } catch (err) { next(err); }
};

exports.updatePaper = async (req, res, next) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Paper not found', fields: null } });
    if (String(paper.authorId) !== String(req.user._id)) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not your paper', fields: null } });
    if (paper.status !== 'revision_required') return res.status(400).json({ success: false, error: { code: 'PAPER_NOT_IN_REVISION', message: 'Paper must be in revision_required status', fields: null } });

    const { title, abstract, revisionNote } = req.body;
    if (req.file) {
      paper.revisionHistory.push({ fileUrl: paper.fileUrl, revisionNote: revisionNote || 'Revised' });
      paper.fileUrl = req.file.path;
    }
    if (title)    paper.title    = title;
    if (abstract) paper.abstract = abstract;
    paper.status = 'under_review';
    await paper.save();
    res.json({ success: true, data: { paper } });
  } catch (err) { next(err); }
};

exports.deletePaper = async (req, res, next) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Paper not found', fields: null } });
    const isOwner = String(paper.authorId) === String(req.user._id);
    const isEditor = req.user.role === 'editor';
    if (!isOwner && !isEditor) return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized to delete this paper', fields: null } });
    if (isEditor && paper.status !== 'published') {
      return res.status(400).json({ success: false, error: { code: 'PAPER_NOT_PUBLISHED', message: 'Editors can only delete published papers', fields: null } });
    }
    if (!isEditor && paper.status === 'published') {
      return res.status(400).json({ success: false, error: { code: 'PAPER_ALREADY_PUBLISHED', message: 'Cannot delete — paper is already published', fields: null } });
    }
    await Publication.deleteOne({ paperId: paper._id });
    await paper.deleteOne();
    res.json({ success: true, data: { message: 'Paper deleted', deletedId: req.params.id } });
  } catch (err) { next(err); }
};

exports.getAllPapers = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    const [papers, total] = await Promise.all([
      Paper.find(query)
        .populate('authorId', 'name email')
        .populate('assignedReviewers', 'name email role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      Paper.countDocuments(query),
    ]);
    const paperIds = papers.map((p) => p._id);
    const reviewCounts = await Review.aggregate([
      { $match: { paperId: { $in: paperIds } } },
      { $group: { _id: '$paperId', submittedCount: { $sum: 1 } } },
    ]);
    const reviewReviewerMapRaw = await Review.aggregate([
      { $match: { paperId: { $in: paperIds } } },
      { $group: { _id: '$paperId', reviewerIds: { $addToSet: '$reviewerId' } } },
    ]);
    const reviewMap = reviewCounts.reduce((acc, r) => {
      acc[String(r._id)] = r.submittedCount;
      return acc;
    }, {});
    const reviewReviewerMap = reviewReviewerMapRaw.reduce((acc, r) => {
      acc[String(r._id)] = (r.reviewerIds || []).map((id) => String(id));
      return acc;
    }, {});
    const items = papers.map((p) => ({
      ...p,
      reviewProgress: {
        submitted: reviewMap[String(p._id)] || 0,
        assigned: Array.isArray(p.assignedReviewers) ? p.assignedReviewers.length : 0,
      },
      submittedReviewerIds: reviewReviewerMap[String(p._id)] || [],
    }));
    res.json({ success: true, data: { items, total, page: Number(page), totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};
