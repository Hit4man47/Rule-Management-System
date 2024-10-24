const ASTNode = require('../models/ASTNode');
const Attribute = require('../models/Attribute');


function tokenize(ruleString) {
    const regex = /\s*([()])\s*|\s*([A-Za-z_][A-Za-z0-9_]*)\s*|\s*(\d+)\s*|\s*([><=!]=?)\s*|\s*('.*?')\s*|\s*(AND|OR|NOT)\s*/g;
    let tokens = [];
    let match;
    while ((match = regex.exec(ruleString)) !== null) {
        tokens.push(match[0].trim());
    }
    return tokens;
}

function infixToPostfix(tokens) {
    const precedence = {
        '(': 0,
        ')': 0,
        OR: 1,
        AND: 2,
        NOT: 2,
        '>': 3,
        '<': 3,
        '>=': 3,
        '<=': 3,
        '=': 3,
        '!=': 3,
    };
    let output = [];
    let operators = [];
    tokens.forEach((token) => {
        if (token === '(') {
            operators.push(token);
        } else if (token === ')') {
            let op = operators.pop();
            while (op !== '(') {
                output.push(op);
                op = operators.pop();
            }
        } else if (precedence[token]) {
            while (
                operators.length &&
                precedence[operators[operators.length - 1]] >= precedence[token]
            ) {
                output.push(operators.pop());
            }
            operators.push(token);
        } else {
            output.push(token);
        }
    });
    while (operators.length) {
        output.push(operators.pop());
    }
    return output;
}

async function buildAST(postfixTokens, ruleId) {
    const stack = [];
    for (const token of postfixTokens) {
        if (['AND', 'OR', 'NOT', '>', '<', '>=', '<=', '=', '!='].includes(token)) {
            const right = stack.pop();
            const left = stack.pop();
            
            if (!left || !right) {
                console.error(`Invalid operands for operator: ${token}`);
                throw new Error(`Invalid operands for operator: ${token}`);
            }
            const node = new ASTNode({
                type: 'operator',
                operator: token,
                left: left._id,
                right: right._id,
                ruleId,
            });
            const savedNode = await node.save();
            if (!savedNode) throw new Error("Failed to save operator node.");
            await ASTNode.findByIdAndUpdate(left._id, { parentId: node._id });
            await ASTNode.findByIdAndUpdate(right._id, { parentId: node._id });
            stack.push(savedNode);
        } else if (/^'.*'$/.test(token)) {
            
            const value = token.slice(1, -1);
            const node = new ASTNode({
                type: 'operand',
                value,
                ruleId,
            });
            const savedNode = await node.save();
            if (!savedNode) throw new Error("Failed to save operand node.");
            stack.push(savedNode);
        } else if (/^\d+$/.test(token)) {
            
            const value = Number(token);
            const node = new ASTNode({
                type: 'operand',
                value,
                ruleId,
            });
            const savedNode = await node.save();
            if (!savedNode) throw new Error("Failed to save number node.");
            stack.push(savedNode);
        } else {
            
            const attribute = await Attribute.findOne({ name: token });
            if (!attribute) {
                throw new Error(`Attribute "${token}" not found in the catalog.`);
            }
            const node = new ASTNode({
                type: 'operand',
                value: token,
                ruleId,
            });
            const savedNode = await node.save();
            if (!savedNode) throw new Error("Failed to save attribute node.");
            stack.push(savedNode);
        }
    }
    return stack.pop(); 
}



module.exports = {
    tokenize,
    infixToPostfix,
    buildAST,
};
