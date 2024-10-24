const mongoose = require('mongoose');

const RuleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    rootNodeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ASTNode',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Rule', RuleSchema);
