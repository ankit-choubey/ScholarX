const Publication = require('../models/Publication');
const Paper       = require('../models/Paper');
const { sendEmail } = require('../services/emailService');

exports.createPublication = async (req, res, next) => {
  try {
    const { paperId, journalName, volume, issue, doi } = req.body;
    const paper = await Paper.findById(paperId).populate('authorId', 'name email');
    if (!paper) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Paper not found', fields: null } });
    if (paper.status === 'published') return res.status(409).json({ success: false, error: { code: 'ALREADY_PUBLISHED', message: 'Paper is already published', fields: null } });
    if (paper.status !== 'accepted') return res.status(400).json({ success: false, error: { code: 'PAPER_NOT_ACCEPTED', message: 'Paper must be accepted before publishing', fields: null } });
    const existing = await Publication.findOne({ paperId });
    if (existing) return res.status(409).json({ success: false, error: { code: 'ALREADY_PUBLISHED', message: 'Paper already published', fields: null } });

    const finalDoi = doi || `10.1234/scholarx.${Date.now()}`;
    const pub = await Publication.create({ paperId, journalName, doi: finalDoi, volume, issue });
    paper.status = 'published';
    await paper.save();
    try {
      await sendEmail(paper.authorId.email, 'paperPublished', paper.authorId.name, paper.title, finalDoi);
    } catch (_) { /* email failure is non-fatal */ }
    res.status(201).json({ success: true, data: { publication: pub } });
  } catch (err) { next(err); }
};

exports.getAllPublications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const order = sort === 'oldest' ? 1 : -1;
    const [items, total] = await Promise.all([
      Publication.find()
        .populate({ path: 'paperId', populate: { path: 'authorId', select: 'name institution' } })
        .sort({ publicationDate: order })
        .skip((page - 1) * limit).limit(Number(limit)).lean(),
      Publication.countDocuments(),
    ]);
    res.json({ success: true, data: { items, total, page: Number(page), totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.getPublicationById = async (req, res, next) => {
  try {
    const pub = await Publication.findById(req.params.id)
      .populate({ path: 'paperId', populate: { path: 'authorId', select: 'name email institution' } });
    if (!pub) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Publication not found', fields: null } });
    res.json({ success: true, data: { publication: pub } });
  } catch (err) { next(err); }
};

exports.updatePublication = async (req, res, next) => {
  try {
    const pub = await Publication.findById(req.params.id);
    if (!pub) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Publication not found', fields: null } });
    const allowed = ['journalName', 'volume', 'issue', 'doi', 'publicationDate'];
    allowed.forEach((f) => { if (req.body[f] !== undefined) pub[f] = req.body[f]; });
    await pub.save();
    res.json({ success: true, data: { publication: pub } });
  } catch (err) { next(err); }
};

exports.deletePublication = async (req, res, next) => {
  try {
    const pub = await Publication.findById(req.params.id);
    if (!pub) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Publication not found', fields: null } });
    // Revert paper status to accepted
    await Paper.findByIdAndUpdate(pub.paperId, { status: 'accepted' });
    await pub.deleteOne();
    res.json({ success: true, data: { message: 'Publication deleted', deletedId: req.params.id } });
  } catch (err) { next(err); }
};
