import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

async function registerUser (req, res) {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userModel.createUser(username, hashedPassword, email);
    res.json(user);
}

async function loginUser (req, res) {
    const { email, password } = req.body;
    const user = await userModel.findUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
        const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
}

const authController = {registerUser, loginUser};

export default authController;
