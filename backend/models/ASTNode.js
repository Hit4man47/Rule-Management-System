const mongoose = require('mongoose');

const ASTNodeSchema = new mongoose.Schema({
    type: {
        type: String, 
        required: true,
    },
    operator: {
        type: String, 
    },
    value: {
        type: mongoose.Schema.Types.Mixed, 
    },
    left: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ASTNode',
    },
    right: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ASTNode',
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ASTNode',
    },
    ruleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rule',
    },
});

module.exports = mongoose.model('ASTNode', ASTNodeSchema);
