const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');

router.post('/', evaluationController.evaluateRule);

module.exports = router;