
const Rule = require('../models/Rule');
const ASTNode = require('../models/ASTNode');
const Attribute = require('../models/Attribute');
const { tokenize, infixToPostfix, buildAST } = require('../services/parser');
const mongoose = require('mongoose');

exports.createRule = async (req, res, next) => {
    try {
        const { ruleName, ruleString } = req.body;
        if (!ruleName) {
            return res.status(400).json({ error: 'Rule name is required' });
        }
        const tokens = tokenize(ruleString);
        const postfixTokens = infixToPostfix(tokens);
        const newRule = new Rule({ name: ruleName });
        const rootNode = await buildAST(postfixTokens, newRule._id);
        if (!rootNode) {
            throw new Error('Failed to build AST. No root node returned.');
        }
        newRule.rootNodeId = rootNode._id;
        const savedRule = await newRule.save();
        if (!savedRule) {
            await cleanupASTNodes(newRule._id);
            throw new Error('Failed to save rule. AST nodes have been cleaned up.');
        }
        res.status(200).json({ message: 'Rule created successfully', rule: savedRule });
    } catch (error) {
        console.error('Error creating rule:', error);
        res.status(500).json({ error: 'Rule creation failed', message: error.message });
    }
};


async function cleanupASTNodes(ruleId) {
    try {
        await ASTNode.deleteMany({ ruleId });
        console.log(`Cleaned up AST nodes for rule: ${ruleId}`);
    } catch (error) {
        console.error('Error cleaning up AST nodes:', error);
    }
}


exports.getRules = async (req, res, next) => {
    try {
        const rules = await Rule.find();
        res.status(200).json({ rules });
    } catch (error) {
        next(error);
    }
};

exports.getRuleAST = async (req, res, next) => {
    try {
        const { id } = req.params;
        const rule = await Rule.findById(id);
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }
        const ast = await buildASTTree(rule.rootNodeId);
        res.status(200).json({ ast });
    } catch (error) {
        next(error);
    }
};

exports.createAttribute = async (req, res, next) => {
    try {
        const { name, type, allowedValues } = req.body;
        const attribute = new Attribute({
            name,
            type,
            allowedValues,
        });
        await attribute.save();
        res.status(201).json({ message: 'Attribute created successfully', attribute });
    } catch (error) {
        next(error);
    }
};


exports.getAttributes = async (req, res, next) => {
    try {
        const attributes = await Attribute.find();
        res.status(200).json({ attributes });
    } catch (error) {
        next(error);
    }
};


const buildASTTree = async (nodeId) => {
    const node = await ASTNode.findById(nodeId);
    if (!node) return null;
    let nodeData = {
        _id: node._id,
        type: node.type,
    };
    if (node.type === 'operator') {
        nodeData.operator = node.operator;
        nodeData.left = await buildASTTree(node.left);
        nodeData.right = await buildASTTree(node.right);
    } else if (node.type === 'operand') {
        nodeData.value = node.value;
    }

    return nodeData;
};


exports.updateRule = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { updatedValues } = req.body;
        if (!Array.isArray(updatedValues) || updatedValues.length === 0) {
            return res.status(400).json({ message: 'No values to update' });
        }
        const rule = await Rule.findById(id);
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }
        for (const updatedValue of updatedValues) {
            const { nodeId, value } = updatedValue;
            const node = await ASTNode.findOne({ _id: nodeId, ruleId: rule._id });
            if (node && node.type === 'operand') {
                console.log(`Updating Node ID: ${nodeId} with Value: ${value}`);
                node.value = value;
                await node.save();
            } else {
                console.log(`Node not found or is not an operand: ${nodeId}`);
            }
        }
        rule.updatedAt = Date.now();
        await rule.save();
        console.log('Rule after update:', await Rule.findById(id));
        res.status(200).json({ message: 'Rule values updated successfully', ruleId: rule._id });
    } catch (error) {
        console.error('Error updating rule:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.combineRules = async (req, res, next) => {
    try {
        const { ruleIds, operator } = req.body;
        if (!['AND', 'OR', 'NOT'].includes(operator)) {
            throw new Error('Invalid operator for combining rules');
        }
        const rules = await Rule.find({ _id: { $in: ruleIds } });
        if (rules.length !== ruleIds.length) {
            throw new Error('One or more rules not found');
        }
        const rootNodes = await Promise.all(
            rules.map((rule) => ASTNode.findById(rule.rootNodeId))
        );
        const combinedRule = new Rule({ name: 'Combined Rule', rootNodeId: null });
        await combinedRule.save();
        let currentNode = rootNodes[0];
        for (let i = 1; i < rootNodes.length; i++) {
            const newNode = new ASTNode({
                type: 'operator',
                operator,
                left: currentNode._id,
                right: rootNodes[i]._id,
                ruleId: combinedRule._id,
            });
            await newNode.save();
            await ASTNode.findByIdAndUpdate(currentNode._id, { parentId: newNode._id });
            await ASTNode.findByIdAndUpdate(rootNodes[i]._id, { parentId: newNode._id });
            currentNode = newNode;
        }
        combinedRule.rootNodeId = currentNode._id;
        await combinedRule.save();
        res.status(201).json({
            ruleId: combinedRule._id,
            message: 'Rules combined successfully',
        });
    } catch (error) {
        next(error);
    }
};
