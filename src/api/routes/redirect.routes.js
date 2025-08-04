// src/api/routes/redirect.routes.js

const express = require('express');
const { redirectToOriginalUrl , verifyPassword} = require('../controllers/url.controller');

const router = express.Router();

// This will handle routes like http://yourdomain.com/someShortCode
// If redirectToOriginalUrl is not a valid function, the error will now
// clearly point to this file instead of the main server file.
router.get('/:shortCode', redirectToOriginalUrl);

// New route to handle password submission for a protected link
router.post('/:shortCode/verify', verifyPassword);

module.exports = router;