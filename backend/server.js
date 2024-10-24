const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');
const ruleRoutes = require('./routes/ruleRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/rules', ruleRoutes);
app.use('/api/evaluate', evaluationRoutes);
app.use('/api/attributes', ruleRoutes);
app.use(errorHandler);

mongoose
    .connect('mongodb://localhost:27017/rule-engine', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Connected to MongoDB');
        
        app.listen(5000, () => {
            console.log('Server is running on port 5000');
        });
    })
    .catch((err) => console.error(err));
