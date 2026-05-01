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
    let { page = 1, limit = 10, sort = 'newest', q, category } = req.query;
    page = Number(page);
    limit = Number(limit);
    const order = sort === 'oldest' ? 1 : -1;

    // Build publication-level filter. We'll restrict by paper IDs when q/category target paper fields.
    const pubFilter = {};

    // If q or category provided, find matching paper IDs first (safe, non-destructive).
    if (q || category) {
      const paperQuery = {};
      if (q) {
        const escaped = q.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'i');
        paperQuery.$or = [
          { title: { $regex: regex } },
          { abstract: { $regex: regex } },
          { keywords: { $regex: regex } },
        ];
      }
      if (category) {
        // match exact keyword element
        paperQuery.$and = paperQuery.$and || [];
        paperQuery.$and.push({ $or: [ { keywords: category } ] });
      }

      const matchingPapers = await Paper.find(paperQuery).select('_id').lean();
      const paperIds = matchingPapers.map((p) => p._id);

      if (paperIds.length) {
        pubFilter.paperId = { $in: paperIds };
      } else {
        // No matching papers — however category might match publication.journalName.
        if (category) pubFilter.$or = [{ journalName: category }];
        else {
          // No matches for search; return empty paginated response without touching other flows.
          return res.json({ success: true, data: { items: [], total: 0, page, totalPages: 0 } });
        }
      }
    }

    // If category provided and pubFilter doesn't already include journalName, allow journalName match as well
    if (category && !pubFilter.$or) {
      pubFilter.$or = pubFilter.paperId ? [ { paperId: pubFilter.paperId }, { journalName: category } ] : [ { journalName: category } ];
      if (pubFilter.paperId) delete pubFilter.paperId; // move into $or to combine both options
    }

    // Query publications with same shape as before
    const [items, total] = await Promise.all([
      Publication.find(pubFilter)
        .populate({ path: 'paperId', populate: { path: 'authorId', select: 'name institution' } })
        .sort({ publicationDate: order })
        .skip((page - 1) * limit).limit(limit).lean(),
      Publication.countDocuments(pubFilter),
    ]);

    res.json({ success: true, data: { items, total, page, totalPages: Math.ceil(total / limit) } });
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
