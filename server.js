const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb://localhost:27017/scamReports', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const scamSchema = new mongoose.Schema({
    type: String,
    detail: String,
    username: String,
});

const Scam = mongoose.model('Scam', scamSchema);

app.use(cors());
app.use(bodyParser.json());

app.post('/api/scams', async (req, res) => {
    const { type, detail, username } = req.body;
    const newScam = new Scam({ type, detail, username });
    await newScam.save();
    res.json(newScam);
});

app.get('/api/scams', async (req, res) => {
    const scams = await Scam.find();
    res.json(scams);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
