const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scams', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
});

const scamSchema = new mongoose.Schema({
    username: String,
    type: String,
    detail: String,
    description: String,
});

const notificationSchema = new mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    message: String,
});

const User = mongoose.model('User', userSchema);
const Scam = mongoose.model('Scam', scamSchema);
const Notification = mongoose.model('Notification', notificationSchema);

app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    try {
        await user.save();
        res.json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'User registration failed' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid password' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token });
});

app.post('/api/scams', async (req, res) => {
    const { username, type, detail, description } = req.body;
    const scam = new Scam({ username, type, detail, description });
    try {
        await scam.save();
        res.json({ message: 'Scam reported successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to report scam' });
    }
});

app.get('/api/scams', async (req, res) => {
    try {
        const scams = await Scam.find();
        res.json(scams);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch scams' });
    }
});

app.post('/api/scams/report', async (req, res) => {
    const { id } = req.body;
    try {
        const scam = await Scam.findById(id);
        if (!scam) {
            return res.status(404).json({ message: 'Scam not found' });
        }
        await Notification.create({ user: scam.user, message: 'Your scam report has been reported.' });
        res.json({ message: 'Scam reported successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to report scam' });
    }
});

app.get('/api/notifications', async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
