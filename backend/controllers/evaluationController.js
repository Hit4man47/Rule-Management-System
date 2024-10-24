const Rule = require('../models/Rule');
const { evaluateNode } = require('../services/evaluator');

exports.evaluateRule = async (req, res, next) => {
    try {
        const { ruleId, userData } = req.body;

        const rule = await Rule.findById(ruleId);
        if (!rule) {
            return res.status(404).json({
                error: 'Rule not found',
                message: `No rule found with ID: ${ruleId}`
            });
        }

        const result = await evaluateNode(rule.rootNodeId, userData);
        res.status(200).json({ result });
    } catch (error) {
        console.error('Evaluation error:', error);
        next(error);
    }
};