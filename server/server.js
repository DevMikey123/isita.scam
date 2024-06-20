const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;
const secret = 'secret'; // For JWT signing
const adminEmail = 'mikeykooijman@outlook.com';

// Connect to MongoDB
mongoose.connect('mongodb://localhost/scam-report', { useNewUrlParser: true, useUnifiedTopology: true });

// Define schemas
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    notifications: [String]
});

const ScamSchema = new mongoose.Schema({
    username: String,
    type: String,
    detail: String,
    description: String,
    reports: { type: Number, default: 0 }
});

const User = mongoose.model('User', UserSchema);
const Scam = mongoose.model('Scam', ScamSchema);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Middleware to verify token and identify admin
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, secret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Routes
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.sendStatus(201);
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.sendStatus(404);
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.sendStatus(403);
    const token = jwt.sign({ email: user.email }, secret, { expiresIn: '1h' });
    res.json({ token });
});

app.post('/submit-scam', authenticateToken, async (req, res) => {
    const { type, detail, description } = req.body;
    const scam = new Scam({ username: req.user.email, type, detail, description });
    await scam.save();
    res.sendStatus(201);
});

app.get('/scams', async (req, res) => {
    const scams = await Scam.find();
    res.json(scams);
});

app.post('/report-scam', authenticateToken, async (req, res) => {
    const { id } = req.body;
    const scam = await Scam.findById(id);
    scam.reports += 1;
    await scam.save();
    res.sendStatus(200);
});

app.delete('/delete-scam/:id', authenticateToken, async (req, res) => {
    if (req.user.email !== adminEmail) return res.sendStatus(403);
    await Scam.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
