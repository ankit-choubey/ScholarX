const express = require('express');
const router  = express.Router();
const { searchPapers } = require('../controllers/searchController');
router.get('/', searchPapers);
module.exports = router;
