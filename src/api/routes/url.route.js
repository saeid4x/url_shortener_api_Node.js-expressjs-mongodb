const express = require('express');
const {
    createShortUrl,
    getMyUrls,
    deleteUrl,
    updateUrl,
    getQrCode,
    getAnalytics
} = require('../controllers/url.controller');
const {protect} = require("../middleware/auth.middleware");

const router = express.Router();

// All routes below this middleware are protected 
router.use(protect);
router.route('/')
    .post(createShortUrl)
    .get(getMyUrls);


router.route('/:id')
    .delete(deleteUrl)
    .patch(updateUrl)

router.get('/:id/qr',getQrCode);
// Add the new analytics route
router.get('/:id/analytics', getAnalytics);

module.exports = router;