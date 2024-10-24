const ASTNode = require('../models/ASTNode');

async function evaluateNode(nodeId, data) {
    const node = await ASTNode.findById(nodeId);
    if (!node) {
        throw new Error('AST Node not found');
    }
    if (node.type === 'operand') {
        if (typeof node.value === 'string' && data.hasOwnProperty(node.value)) {
            return data[node.value];
        } else {
            return node.value;
        }
    } else if (node.type === 'operator') {
        const leftValue = await evaluateNode(node.left, data);
        const rightValue = await evaluateNode(node.right, data);
        switch (node.operator) {
            case 'AND':
                return leftValue && rightValue;
            case 'OR':
                return leftValue || rightValue;
            case 'NOT':
                return !rightValue;
            case '>':
                return leftValue > rightValue;
            case '<':
                return leftValue < rightValue;
            case '>=':
                return leftValue >= rightValue;
            case '<=':
                return leftValue <= rightValue;
            case '=':
                return leftValue === rightValue;
            case '!=':
                return leftValue !== rightValue;
            default:
                throw new Error(`Unknown operator "${node.operator}"`);
        }
    }
}

module.exports = {
    evaluateNode,
};
