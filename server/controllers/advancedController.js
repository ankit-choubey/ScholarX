const Paper  = require('../models/Paper');
const { runPlagiarismCheck } = require('../services/plagiarismService');
const { formatCitation }     = require('../services/citationService');

exports.checkPlagiarism = async (req, res, next) => {
  try {
    const { paperId } = req.body;
    if (!paperId) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'paperId is required', fields: { paperId: 'required' } } });
    const paper = await Paper.findById(paperId);
    if (!paper) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Paper not found', fields: null } });
    const result = await runPlagiarismCheck(paper);
    paper.plagiarismScore = result.score;
    await paper.save();
    res.json({ success: true, data: { result, paperId: paper._id, isMock: true } });
  } catch (err) { next(err); }
};

exports.formatCitationRoute = async (req, res, next) => {
  try {
    const { paperId, format } = req.body;
    const allowed = ['apa','mla','chicago','ieee'];
    if (!allowed.includes(format)) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'format must be apa, mla, chicago, or ieee', fields: { format: 'invalid' } } });
    const paper = await Paper.findById(paperId).populate('authorId', 'name');
    if (!paper) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Paper not found', fields: null } });
    const citation = formatCitation(paper, paper.authorId?.name, format);
    res.json({ success: true, data: { citation, format, isMock: true } });
  } catch (err) { next(err); }
};
