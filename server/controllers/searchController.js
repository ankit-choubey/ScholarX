const Paper = require('../models/Paper');

exports.searchPapers = async (req, res, next) => {
  try {
    const { q, status, page = 1, limit = 10 } = req.query;
    if (!q || q.trim().length < 2) return res.status(400).json({ success: false, error: { code: 'MISSING_QUERY', message: "Query 'q' is required (min 2 chars)", fields: { q: 'required' } } });
    const query = { $text: { $search: q } };
    if (status) query.status = status;
    const [items, total] = await Promise.all([
      Paper.find(query, { score: { $meta: 'textScore' } })
        .populate('authorId', 'name')
        .sort({ score: { $meta: 'textScore' } })
        .skip((page - 1) * limit).limit(Number(limit)).lean(),
      Paper.countDocuments(query),
    ]);
    res.json({ success: true, data: { items, total, page: Number(page), totalPages: Math.ceil(total / limit), query: q } });
  } catch (err) { next(err); }
};
