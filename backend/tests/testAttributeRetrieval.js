// Test script to check attribute retrieval
const mongoose = require('mongoose');
const Attribute = require('../models/Attribute');

mongoose
    .connect('mongodb://localhost:27017/rule-engine', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        const attributeName = 'age'; // Replace with the attribute you're testing
        const attribute = await Attribute.findOne({ name: attributeName });
        if (attribute) {
            console.log(`Attribute "${attributeName}" found in the catalog.`);
        } else {
            console.log(`Attribute "${attributeName}" NOT found in the catalog.`);
        }
        mongoose.disconnect();
    })
    .catch((err) => console.error(err));
