const mongoose = require('mongoose');

const AttributeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String, 
        required: true,
    },
    allowedValues: {
        type: [mongoose.Schema.Types.Mixed], 
    },
});

module.exports = mongoose.model('Attribute', AttributeSchema);
