const express = require('express');
const router  = express.Router();
const { protect }   = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const { getAnalytics } = require('../controllers/analyticsController');
router.get('/', protect, authorize('editor'), getAnalytics);
module.exports = router;
