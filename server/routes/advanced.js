const express = require('express');
const router  = express.Router();
const { protect }   = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const c = require('../controllers/advancedController');

router.post('/plagiarism', protect, authorize('researcher','editor'), c.checkPlagiarism);
router.post('/citation',   protect, c.formatCitationRoute);

module.exports = router;
