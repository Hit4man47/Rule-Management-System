const mongoose = require('mongoose');
const Attribute = require('./models/Attribute');

mongoose
    .connect('mongodb://localhost:27017/rule-engine', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async () => {
        console.log('Connected to MongoDB');

        const attributes = [
            { name: 'age', type: 'number' },
            { name: 'department', type: 'string', allowedValues: ['Sales', 'Marketing'] },
            { name: 'salary', type: 'number' },
            { name: 'experience', type: 'number' },
        ];

        await Attribute.deleteMany({});
        await Attribute.insertMany(attributes);

        console.log('Attributes seeded');
        mongoose.disconnect();
    })
    .catch((err) => console.error(err));
