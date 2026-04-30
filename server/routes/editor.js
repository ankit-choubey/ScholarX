const express = require('express');
const router  = express.Router();
const { protect }   = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const c = require('../controllers/editorController');

router.post('/assign',            protect, authorize('editor'), c.assignReviewer);
router.put('/decision/:paperId',  protect, authorize('editor'), c.decisionOnPaper);
router.get('/overview',           protect, authorize('editor'), c.getSubmissionsOverview);
router.get('/reviewers',          protect, authorize('editor'), c.getAvailableReviewers);

module.exports = router;
