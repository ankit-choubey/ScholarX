const express = require('express');
const router  = express.Router();
const { protect }   = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const c = require('../controllers/reviewController');

router.get('/assigned',        protect, authorize('reviewer'), c.getAssignedPapers);
router.post('/',               protect, authorize('reviewer'), c.submitReview);
router.get('/paper/:paperId',  protect, authorize('editor'),   c.getReviewsByPaper);
router.put('/:id',             protect, authorize('reviewer'), c.updateReview);

module.exports = router;
