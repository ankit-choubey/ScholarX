const express = require('express');
const router  = express.Router();
const { protect }   = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const c = require('../controllers/publicationController');

// NOTE: specific string routes MUST come before /:id to prevent "my" being cast as ObjectId
router.get('/',     c.getAllPublications);
router.get('/:id',  c.getPublicationById);
router.post('/',    protect, authorize('editor'), c.createPublication);
router.put('/:id',  protect, authorize('editor'), c.updatePublication);
router.delete('/:id', protect, authorize('editor'), c.deletePublication);

module.exports = router;
