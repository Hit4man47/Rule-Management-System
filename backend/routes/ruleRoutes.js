const express = require('express');
const router = express.Router();
const ruleController = require('../controllers/ruleController');

router.post('/combine', ruleController.combineRules);
router.get('/:id/ast', ruleController.getRuleAST);
router.get('/', ruleController.getRules);
router.post('/', ruleController.createRule);
router.post('/attributes', ruleController.createAttribute);
router.get('/attributes', ruleController.getAttributes);
router.put('/:id', ruleController.updateRule);


module.exports = router;
