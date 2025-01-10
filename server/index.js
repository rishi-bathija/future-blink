const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const flowchartRoutes = require('./routes/flowchart');
require("dotenv").config();

app.use(cors(
    { origin: ['http://localhost:3000', "https://future-blink-frontend-five.vercel.app"] }
));

app.use(bodyParser.json());

mongoose.connect(process.env.EMAILFLOWDB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

app.use('/api', flowchartRoutes);

app.listen(5000, () => {
    console.log('Server started on port 5000');
});