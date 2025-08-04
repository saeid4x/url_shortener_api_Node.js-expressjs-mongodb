const express = require("express");
const {register , login , logout} = require("../controllers/auth.controller");
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout',protect,logout);


module.exports = router;