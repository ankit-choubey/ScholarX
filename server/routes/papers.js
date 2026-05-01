const express = require('express');
const router  = express.Router();
const { protect }   = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const upload  = require('../middleware/upload');
const c       = require('../controllers/paperController');

router.post('/',     protect, authorize('researcher'), upload.single('file'), c.submitPaper);
router.get('/my',    protect, authorize('researcher'), c.getMyPapers);
router.get('/',      protect, authorize('editor'),     c.getAllPapers);
router.get('/:id',   protect, c.getPaperById);
router.put('/:id',   protect, authorize('researcher'), upload.single('file'), c.updatePaper);
router.delete('/:id',protect, authorize('researcher','editor'), c.deletePaper);

module.exports = router;
